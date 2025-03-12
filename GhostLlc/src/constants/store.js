import {
    CX05_Magnetic_cooler,
    CX07_Magnetic_cooler,
    CX08_Magnetic_cooler,
    Memo_DI05, Memo_DLA5,
    Memo_DLA52, Memo_DLA7,
    Memo_DLA72,
    NonGamerPackage,
    ProGamerPackage1,
    ProGamerPackage2,
    ProGamerPackage3,
    RookieGamerPackage1,
    RookieGamerPackage2,
    RookieGamerPackage3
} from "../utils";

const xennaStore = [
    {
        id: 1,
        category: "Magnetic Coolers",
        types: [
            {
                id: 101,
                slug: "cx05-magnetic-cooler",
                title: "CX05 Magnetic Cooler",
                reviews: "50K",
                info: "CX05 Magnetic Cooler - Cools your phone down while gaming, comes in handy!",
                img: CX05_Magnetic_cooler,
                screenShots: [
                    {
                        id: 1,
                        img: CX05_Magnetic_cooler,
                    },
                    {
                        id: 2,
                        img: CX05_Magnetic_cooler,
                    },
                    {
                        id: 3,
                        img: CX05_Magnetic_cooler,
                    },
                    {
                        id: 4,
                        img: CX05_Magnetic_cooler,
                    },
                ]
            },
            {
                id: 102,
                slug: "cx07-magnetic-cooler",
                title: "CX07 Magnetic Cooler",
                reviews: "32K",
                info: "CX07 Magnetic Cooler - Cools your phone down while gaming, comes in handy!",
                img: CX07_Magnetic_cooler,
                screenShots: [
                    {
                        id: 1,
                        img: CX07_Magnetic_cooler,
                    },
                    {
                        id: 2,
                        img: CX07_Magnetic_cooler,
                    },
                    {
                        id: 3,
                        img: CX07_Magnetic_cooler,
                    },
                    {
                        id: 4,
                        img: CX07_Magnetic_cooler,
                    },
                ]
            },
            {
                id: 103,
                slug: "cx08-magnetic-cooler",
                title: "CX08 Magnetic Cooler",
                reviews: "44K",
                info: "CX08 Magnetic Cooler - Cools your phone down while gaming, comes in handy!",
                img: CX08_Magnetic_cooler,
                screenShots: [
                    {
                        id: 1,
                        img: CX08_Magnetic_cooler,
                    },
                    {
                        id: 2,
                        img: CX08_Magnetic_cooler,
                    },
                    {
                        id: 3,
                        img: CX08_Magnetic_cooler,
                    },
                    {
                        id: 4,
                        img: CX08_Magnetic_cooler,
                    },
                ]
            }
        ]
    },
    {
        id: 2,
        category: "Phone Coolers",
        types: [
            {
                id: 201,
                slug: "memo-di05-phone-cooler",
                title: "Memo DI05 Phone Cooler",
                reviews: "27K",
                info: "Memo DI05 Phone Cooler - Cools your phone down while gaming, comes in handy!",
                img: Memo_DI05,
                screenShots: [
                    {
                        id: 1,
                        img: Memo_DI05,
                    },
                    {
                        id: 2,
                        img: Memo_DI05,
                    },
                    {
                        id: 3,
                        img: Memo_DI05,
                    },
                    {
                        id: 4,
                        img: Memo_DI05,
                    },
                ]
            },
            {
                id: 202,
                slug: "memo-dla5-phone-cooler",
                title: "Memo DLA5 Phone Cooler",
                reviews: "30K",
                info: "Memo DLA5 Phone Cooler - Cools your phone down while gaming, comes in handy!",
                img: Memo_DLA5,
                screenShots: [
                    {
                        id: 1,
                        img: Memo_DLA52,
                    },
                    {
                        id: 2,
                        img: Memo_DLA5,
                    },
                    {
                        id: 3,
                        img: Memo_DLA5,
                    },
                    {
                        id: 4,
                        img: Memo_DLA5,
                    },
                ]
            },
            {
                id: 203,
                slug: "memo-dla7-phone-cooler",
                title: "Memo DLA7 Phone Cooler",
                reviews: "22K",
                info: "Memo DLA7 Phone Cooler - Cools your phone down while gaming, comes in handy!",
                img: Memo_DLA7,
                screenShots: [
                    {
                        id: 1,
                        img: Memo_DLA72,
                    },
                    {
                        id: 2,
                        img: Memo_DLA7,
                    },
                    {
                        id: 3,
                        img: Memo_DLA7,
                    },
                    {
                        id: 4,
                        img: Memo_DLA7,
                    },
                ]
            }
        ]
    },
    {
        id: 3,
        category: "Gift Packages",
        types: [
            {
                id: 301,
                slug: "pro-gamer-packages",
                title: "Pro Gamer Packages",
                reviews: "70K",
                info: "Memo DI05 Phone Cooler - Cools your phone down while gaming, comes in handy!",
                img: ProGamerPackage1,
                screenShots: [
                    {
                        id: 1,
                        img: ProGamerPackage1,
                    },
                    {
                        id: 2,
                        img: ProGamerPackage2,
                    },
                    {
                        id: 3,
                        img: ProGamerPackage3,
                    },
                    {
                        id: 4,
                        img: ProGamerPackage1,
                    },
                ]
            },
            {
                id: 302,
                slug: "rookie-gamer-packages",
                title: "Rookie Gamer Packages",
                reviews: "50K",
                info: "Memo DI05 Phone Cooler - Cools your phone down while gaming, comes in handy!",
                img: RookieGamerPackage1,
                screenShots: [
                    {
                        id: 1,
                        img: RookieGamerPackage2,
                    },
                    {
                        id: 2,
                        img: RookieGamerPackage3,
                    },
                    {
                        id: 3,
                        img: RookieGamerPackage1,
                    },
                    {
                        id: 4,
                        img: RookieGamerPackage2,
                    },
                ]
            },
            {
                id: 303,
                slug: "non-gamer-packages",
                title: "Non-Gamer Packages",
                reviews: "30K",
                info: "Memo DI05 Phone Cooler - Cools your phone down while gaming, comes in handy!",
                img: NonGamerPackage,
                screenShots: [
                    {
                        id: 1,
                        img: NonGamerPackage,
                    },
                    {
                        id: 2,
                        img: NonGamerPackage,
                    },
                    {
                        id: 3,
                        img: NonGamerPackage,
                    },
                    {
                        id: 4,
                        img: NonGamerPackage,
                    },
                ]
            }
        ]
    }
]

export default xennaStore