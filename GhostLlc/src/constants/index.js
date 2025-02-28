import { COD_Thumbnail, CODScreenShot_1, CODScreenShot_2, CODScreenShot_3, God_of_War_ScreenShot_1, God_of_War_ScreenShot_2, God_of_War_ScreenShot_3, Gow_Thumbnail, Tekken8ScreenShot_1, Tekken8ScreenShot_2, Tekken8ScreenShot_3, Tekken_Thumbnail } from "../utils";

const availableAccounts = [
    {
        id: 1,
        slug: "god-of-war-ragnarok",
        title: "God of War: Ragnarök (Complete Upgrades)",
        views: "37.2K",
        img: Gow_Thumbnail,
        screenShots: [
            {
                id: 1,
                img: God_of_War_ScreenShot_1,
            },
            {
                id: 2,
                img: God_of_War_ScreenShot_2,
            },
            {
                id: 3,
                img: God_of_War_ScreenShot_3,
            },
        ]
    },
    {
        id: 2,
        slug: "tekken8-the-ghost-fighter",
        title: "Tekken8: The Ghost Fighter",
        views: "500K",
        img: Tekken_Thumbnail,
        screenShots: [
            {
                id: 1,
                img: Tekken8ScreenShot_1,
            },
            {
                id: 2,
                img: Tekken8ScreenShot_2,
            },
            {
                id: 3,
                img: Tekken8ScreenShot_3,
            },
        ]
    },
    {
        id: 3,
        slug: "call-of-duty-modern-warfare-iii",
        title: "Call of Duty®: Modern Warfare® III",
        views: "84.2K",
        img: COD_Thumbnail,
        screenShots: [
            {
                id: 1,
                img: CODScreenShot_1,
            },
            {
                id: 2,
                img: CODScreenShot_2,
            },
            {
                id: 3,
                img: CODScreenShot_3,
            },
        ]
    }
]

export default availableAccounts