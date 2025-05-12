export interface User {
    id: number;
    username: string;
    role: string;
    firstName: string;
    lastName: string;
    email: string;
    birthDate: string;
    totalRides: number;
    ratings: number[];
    carType: string;
    profileImageBase64: string;
}
