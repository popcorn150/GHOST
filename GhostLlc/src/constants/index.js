import { COD_Thumbnail, CODScreenShot_1, CODScreenShot_2, CODScreenShot_3, Dragons_Dogma2_Screenshot_1, Dragons_Dogma2_Screenshot_2, Dragons_Dogma2_Screenshot_3, Dragons_Dogma2_Thumbnail, God_of_War_ScreenShot_1, God_of_War_ScreenShot_2, God_of_War_ScreenShot_3, Gow_Thumbnail, Tekken8ScreenShot_1, Tekken8ScreenShot_2, Tekken8ScreenShot_3, Tekken_Thumbnail, The_Crew2_Screenshot_1, The_Crew2_Screenshot_2, The_Crew2_Screenshot_3, The_Crew2_Thumbnail } from "../utils";

const availableAccounts = [
    {
        id: 1,
        slug: "god-of-war-ragnarok",
        title: "God of War: Ragnarök (Complete Upgrades)",
        views: "37.2K",
        img: Gow_Thumbnail,
        details: "'God of War: Ragnarok' is an action-adventure game developed by Santa Monica Studio and published by Sony Interactive Entertainment Serving as a direct sequel to the critically acclaimed 'God of War' (2018), the game continues the story of Kratos, the former Greek god of war, and his son Atreus as they navigate the perilous world of Norse mythology.",
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
        details: "'God of War: Ragnarok' is an action-adventure game developed by Santa Monica Studio and published by Sony Interactive Entertainment Serving as a direct sequel to the critically acclaimed 'God of War' (2018), the game continues the story of Kratos, the former Greek god of war, and his son Atreus as they navigate the perilous world of Norse mythology.",
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
    },
    {
        id: 4,
        slug: "the-crew-2",
        title: "The Crew™ 2",
        views: "93.1K",
        img: The_Crew2_Thumbnail,
        screenShots: [
            {
                id: 1,
                img: The_Crew2_Screenshot_1,
            },
            {
                id: 2,
                img: The_Crew2_Screenshot_2,
            },
            {
                id: 3,
                img: The_Crew2_Screenshot_3,
            },
        ]
    },
    {
        id: 5,
        slug: "dragons-dogma-2",
        title: "Dragon's Dogma 2",
        views: "125.8K",
        img: Dragons_Dogma2_Thumbnail,
        screenShots: [
            {
                id: 1,
                img: Dragons_Dogma2_Screenshot_1,
            },
            {
                id: 2,
                img: Dragons_Dogma2_Screenshot_2,
            },
            {
                id: 3,
                img: Dragons_Dogma2_Screenshot_3,
            },
        ]
    }
]

export default availableAccounts