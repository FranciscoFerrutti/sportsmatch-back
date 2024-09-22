import Users from "../../models/user.models";


describe("Orm test", () => {
    it("should return a valid instance of orm", async () => {
        try {
            // const uNew = await Users.create({
            //     firstname: "Gaston",
            //     lastname: "De Schant",
            //     phone_number: "+5492234910125",
            //     email: "gdeschant@itba.edu.ar",
            // });
            // expect(uNew).toBeDefined();
            // console.log(uNew);
        } catch (e) {
            console.log(e);
        }
    });
});