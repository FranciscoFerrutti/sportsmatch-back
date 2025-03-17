import {IAvailableSlotGroup, IReservationDetail} from "../interfaces/reservation.interface";
import ReservationPersistence from "../database/persistence/reservation.persistence";
import EventsService from "./events.service";
import FieldsService from "./field.service";
import TimeSlotsService from "./timeslots.service";
import ClubService from "./club.service";
import NotFoundException from "../exceptions/notFound.exception";
import GenericException from "../exceptions/generic.exception";
import {HTTP_STATUS} from "../constants/http.constants";
import {ReservationStatus} from "../constants/reservation.constants";
import IEventDetailDto from "../dto/eventDetail.dto";
import TimeSlot from "../database/models/TimeSlot.model";
import {OrganizerType} from "../constants/event.constants";
import Reservation from "../database/models/Reservation.model";
import {MailService} from "./mail.service";
import {PaymentService} from "./payment.service";
import ParticipantService from "./participant.service";

class ReservationsService {
    private static instance: ReservationsService;
    private readonly reservationPersistence: ReservationPersistence;
    private readonly eventsService: EventsService;
    private readonly fieldsService: FieldsService;
    private readonly timeSlotsService: TimeSlotsService;
    private readonly clubService: ClubService;
    private readonly participantService: ParticipantService;
    private paymentService: PaymentService;

    private constructor() {
        this.reservationPersistence = new ReservationPersistence();
        this.eventsService = EventsService.getInstance();
        this.fieldsService = FieldsService.getInstance();
        this.timeSlotsService = TimeSlotsService.getInstance();
        this.clubService = ClubService.getInstance();
        this.paymentService = PaymentService.getInstance(this);
        this.participantService = ParticipantService.getInstance();
    }

    public static getInstance(): ReservationsService {
        if (!this.instance) {
            this.instance = new ReservationsService();
        }
        return this.instance;
    }

    private async getAndValidateEventOwnership(eventId: number, userId: string): Promise<IEventDetailDto> {
        const event = await this.eventsService.getEventById(eventId.toString());

        if (!event) {
            throw new NotFoundException("Event");
        }
        if (event.owner.id.toString() !== userId) {
            throw new GenericException({
                message: "User is not the owner of the event",
                status: HTTP_STATUS.FORBIDDEN,
                internalStatus: "NOT_EVENT_OWNER"
            });
        }
        return event
    }

    public async findAvailableSlots(
        eventId: number,
        userId: string,
        radius?: number,
        maxResults?: number
    ): Promise<IAvailableSlotGroup[]> {
        const event = await this.getAndValidateEventOwnership(eventId, userId);
        const nearbyClubs = await this.clubService.getNearClubs(event.location, radius);
        const availableSlots: IAvailableSlotGroup[] = [];

        for (const clubLocation of nearbyClubs) {
            const club = clubLocation.club;
            
            const fields = await this.fieldsService.getFieldsByClubAndSport(
                club.id,
                event.sportId
            );

            for (const field of fields) {
                const slots = await this.timeSlotsService.findConsecutiveAvailableSlots(
                    field.id,
                    new Date(event.schedule),
                    event.duration
                );

                if (slots.length > 0) {
                    availableSlots.push({
                        fieldId: field.id,
                        clubId: club.id,
                        clubName: club.name,
                        location: clubLocation.address,
                        availableSlots: slots.map(slot => ({
                            slotIds: slot.slotIds,
                            startTime: slot.startTime,
                            endTime: slot.endTime,
                            totalCost: slot.slotIds.length * field.cost_per_slot
                        }))
                    });
                }
            }
        }

        if (maxResults && maxResults > 0) {
            return availableSlots.slice(0, maxResults);
        }

        return availableSlots;
    }

    public async createReservation(
        eventId: number,
        fieldId: number,
        slotIds: number[],
        userId: string
    ): Promise<IReservationDetail> {
        const transaction = await this.reservationPersistence.startTransaction();
        
        try {
            const event = await this.getAndValidateEventOwnership(eventId, userId);

            const slots = await this.timeSlotsService.checkAndLockSlots(slotIds, transaction);
            this.validateSlots(slots, fieldId);

            const field = await this.fieldsService.getFieldById(fieldId.toString());
            const totalCost = slots.length * field.cost_per_slot;

            const reservation = await this.reservationPersistence.createReservation(
                {
                    eventId,
                    fieldId,
                    cost: totalCost,
                    status: ReservationStatus.PENDING
                },
                slotIds,
                transaction
            );

            await transaction.commit();
            await MailService.sendReservationSubmit(event.owner.email, reservation.field.club.name, event.schedule);
            await MailService.sendClubReservationSubmit(reservation.field?.club?.email, reservation.field?.name, event.schedule);
            return await this.mapToReservationDetail(reservation);

        } catch (error) {
            try {
                await transaction.rollback();
            } catch {
                // Ignore rollback error if transaction is already finished
            }
            throw error;
        }
    }

    public async getReservationsByEvent(
        eventId: number,
        userId: number
    ): Promise<IReservationDetail[]> {
        await this.checkOwnershipForGetReservation(eventId.toString(), userId);

        const reservations = await this.reservationPersistence.findAllByEventId(eventId);
        return Promise.all(reservations.map(async reservation => {
            const reservationDetail = await this.mapToReservationDetail(reservation);

            const paymentInfo = await this.paymentService.getPaymentAndRefundInfoByReservationId(reservation.id);

            return {
                ...reservationDetail,
                payment: {
                    isPaid: paymentInfo.isPaid,
                    paymentDate: paymentInfo.paymentDate,
                    paymentAmount: paymentInfo.paymentAmount,
                    isRefunded: paymentInfo.isRefunded,
                    refundDate: paymentInfo.refundDate,
                    refundAmount: paymentInfo.refundAmount
                }
            };
        }));
    }

    public async confirmReservation(
        reservationId: number,
        status: ReservationStatus,
        userId: number
    ): Promise<IReservationDetail> {
        const reservation = await this.findReservation(reservationId)

        await this.checkFieldOwnership(reservation.field?.club?.id, userId)

        const updatedReservation = await this.reservationPersistence.updateStatus(
            reservationId,
            status
        );

        if (status === ReservationStatus.CONFIRMED) {
            const clubLocation = await this.reservationPersistence.findClubLocationByReservation(reservationId);
            if (!clubLocation) {
                throw new NotFoundException("Club location");
            }

            const timeSlots = await this.timeSlotsService.findTimeSlotsByReservation(reservationId);
            if (!timeSlots || timeSlots.length === 0) {
                throw new NotFoundException("Time slots");
            }

            const firstSlot = timeSlots[0];

            const totalDuration = timeSlots.length * firstSlot.field.slot_duration;

            const scheduleDate = new Date(firstSlot.availability_date);
            const [hours, minutes] = firstSlot.start_time.toString().split(':');
            scheduleDate.setUTCHours(parseInt(hours), parseInt(minutes), 0, 0);

            await this.eventsService.updateEventById(updatedReservation.eventId.toString(), {
                location: clubLocation.locality,
                schedule: scheduleDate,
                duration: totalDuration
            });

            await MailService.sendReservationConfirmed(updatedReservation.event.userOwner.email, reservationId, reservation.field?.club?.name, firstSlot.availability_date.toString(), firstSlot.start_time.toString());
        }

        return this.mapToReservationDetail(updatedReservation);
    }

    public async cancelReservation(
        reservationId: number,
        organizerType: OrganizerType,
        userId: number
    ): Promise<void> {
        const reservation = await this.findReservationWithOwnerDetails(reservationId);
        console.log("Found reservation: ", reservation)
        const reservationStatus = reservation.status

        if (organizerType === OrganizerType.CLUB) {
            await this.checkFieldOwnership(reservation.field?.club?.id, userId);
        } else {
            await this.checkEventOwnership(reservation.eventId.toString(), userId);
        }

        const transaction = await this.reservationPersistence.startTransaction();

        try {
            await this.reservationPersistence.updateStatus(
                reservationId,
                ReservationStatus.CANCELLED,
                transaction
            );

            await this.timeSlotsService.releaseSlots(
                reservation.timeSlots.map(slot => slot.id),
                transaction
            );

            const now = new Date();
            const scheduleDate = new Date(reservation.event.schedule);
            const timeDifference = scheduleDate.getTime() - now.getTime();
            const hoursUntilReservation = (timeDifference / (1000 * 60 * 60)) + 3;

            if (reservationStatus == ReservationStatus.COMPLETED && (organizerType === OrganizerType.CLUB  || hoursUntilReservation >= 24) ) {
                const refund = await this.paymentService.refundPayment(reservationId);
                await MailService.sendUserReservationRefund(reservation.event.userOwner.email, reservationId, reservation.field.club.name, reservation.event.schedule.getDate().toString(),  (reservation.event.schedule.getMonth()+1).toString(), reservation.event.schedule.getHours().toString(), refund.amountRefunded);
                await MailService.sendClubReservationRefund(reservation.field.club.email, reservationId, reservation.field.name, reservation.event.schedule.getDate().toString(),  (reservation.event.schedule.getMonth()+1).toString(),reservation.event.schedule.getHours().toString(), reservation.cost / 2);

            } else {
                await MailService.sendUserReservationDeclined(reservation.event.userOwner.email, reservationId, reservation.field.club.name, reservation.event.schedule.getUTCDate().toString(), (reservation.event.schedule.getMonth()+1).toString(), reservation.event.schedule.getUTCHours().toString());
                console.log("Reservation is less than 24 hours away and organizer is a user. No refund.");
            }

            await transaction.commit();

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    private validateSlots(slots: TimeSlot[], fieldId: number): void {
        if (slots.length === 0 || slots.some(slot => slot.field_id !== fieldId)) {
            throw new GenericException({
                message: "Invalid time slots",
                status: HTTP_STATUS.BAD_REQUEST,
                internalStatus: "INVALID_SLOTS"
            });
        }

        for (let i = 1; i < slots.length; i++) {
            const prevSlot = slots[i - 1];
            const currentSlot = slots[i];
            
            if (
                prevSlot.availability_date !== currentSlot.availability_date ||
                prevSlot.end_time !== currentSlot.start_time
            ) {
                throw new GenericException({
                    message: "Time slots must be consecutive",
                    status: HTTP_STATUS.BAD_REQUEST,
                    internalStatus: "NON_CONSECUTIVE_SLOTS"
                });
            }
        }
    }

    private async mapToReservationDetail(reservation: any): Promise<IReservationDetail> {
        const field = await this.fieldsService.getFieldById(reservation.fieldId.toString());
        
        return {
            id: reservation.id,
            eventId: reservation.eventId,
            fieldId: reservation.fieldId,
            status: reservation.status,
            cost: reservation.cost,
            timeSlots: reservation.timeSlots.map((slot: any) => ({
                id: slot.id,
                startTime: slot.start_time,
                endTime: slot.end_time,
                date: slot.availability_date
            })),
            field: {
                name: field.name,
                clubId: field.club_id,
                clubName: field.club.name
            }
        };
    }

    private async checkFieldOwnership(clubId: number, userId: number){
        if (clubId !== userId) {
            throw new GenericException({
                message: "Field does not belong to club",
                status: HTTP_STATUS.FORBIDDEN,
                internalStatus: "INVALID_FIELD_ACCESS"
            });
        }
    }

    public async findReservation(reservationId: number){
        const reservation = await this.reservationPersistence.findById(reservationId);
        if (!reservation) {
            throw new NotFoundException("Reservation");
        }
        return reservation
    }

    private async checkEventOwnership(eventId: string, userId: number) {
        const event = await this.eventsService.getEventById(eventId);
        if (!event || event.owner.id !== userId) {
            throw new GenericException({
                message: "Event does not belong to user",
                status: HTTP_STATUS.FORBIDDEN,
                internalStatus: "INVALID_EVENT_ACCESS"
            });
        }
    }

    private async checkOwnershipForGetReservation(eventId: string, userId: number) {
        const event = await this.eventsService.getEventById(eventId);
        if (!event) {
            throw new GenericException({
                message: "Event not found",
                status: HTTP_STATUS.NOT_FOUND,
                internalStatus: "EVENT_NOT_FOUND"
            });
        }
        
        const isParticipant = await this.participantService.existParticipant(eventId, userId.toString());
        
        if (event.owner.id !== userId && !isParticipant) {
            throw new GenericException({
                message: "User is not authorized to access this event",
                status: HTTP_STATUS.FORBIDDEN,
                internalStatus: "INVALID_EVENT_ACCESS"
            });
        }
    }

    public async getReservationsByClub(
        clubId: number,
        status?: ReservationStatus
    ): Promise<IReservationDetail[]> {
        const reservations = await this.reservationPersistence.findByClub(clubId, status);
        
        return Promise.all(reservations.map(async reservation => {
            const reservationDetail = await this.mapToReservationDetail(reservation);
            
            const paymentInfo = await this.paymentService.getPaymentAndRefundInfoByReservationId(reservation.id);
            
            return {
                ...reservationDetail,
                payment: {
                    isPaid: paymentInfo.isPaid,
                    paymentDate: paymentInfo.paymentDate,
                    paymentAmount: paymentInfo.paymentAmount,
                    isRefunded: paymentInfo.isRefunded,
                    refundDate: paymentInfo.refundDate,
                    refundAmount: paymentInfo.refundAmount
                }
            };
        }));
    }

    public async completeReservation(reservationId: number): Promise<IReservationDetail> {
        const updatedReservation = await this.reservationPersistence.updateStatus(
            reservationId,
            ReservationStatus.COMPLETED
        );
        return this.mapToReservationDetail(updatedReservation);
    }

    public async findReservationWithOwner(reservationId: number): Promise<Reservation> {
        const reservation = await this.reservationPersistence.findReservationWithOwnerDetails(reservationId);
        if (!reservation) {
            throw new NotFoundException("Reservation");
        }
        return reservation;
    }

    public async findReservationWithOwnerDetails(reservationId: number): Promise<Reservation> {
        const reservation = await this.reservationPersistence.findReservationWithOwnerDetails(reservationId);
        if (!reservation) {
            throw new NotFoundException("Reservation");
        }
        return reservation;
    }
}

export default ReservationsService; 