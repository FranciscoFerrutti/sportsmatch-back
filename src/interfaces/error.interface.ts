// This is the generic format for passing errors on interfaces of events, sockets, or whatever
// If you need to send an error to someone else then use this format
export interface IError {
    status?: number;                // An identifying value that should help detect what type of error it is, preferably it should be unique across the whole site
    message: string;                // A human-readable message explaining what the error is
    full?: string;                  // The JSON.stringify() of the javascript error, if there is any
}

// This is the format for internal errors (AKA what we pass to GenericException and the format ERRORS constant follows)
export interface IErrorData {
    status: number
    internalStatus: string
    message: string
}