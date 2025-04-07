const gameDoc = [
    {
        id: 1,
        game: "Call of Duty: Mobile",
        steps: [
            {
                id: 101,
                step: "Obtain Current Credentials: Ask the seller for login details (Activision, Facebook, or Apple ID)."
            },
            {
                id: 102,
                step: "Change Login Credentials:",
                list: [
                    {
                        id: 1,
                        step: "If linked to Activision: Change the email and password from Activision’s website."
                    },
                    {
                        id: 2,
                        step: "If linked to Apple ID: The seller must remove the account from their Apple ID settings before you can link yours."
                    }
                ]
            },
            {
                id: 103,
                step: "Unlink Additional Accounts: Ensure no secondary links (like Google Play or Garena) remain under the seller’s control."
            },
            {
                id: 104,
                step: "Confirm Full Ownership: Log out and log back in to verify everything is under your credentials."
            }
        ],
        precautions: [
            {
                id: 1,
                step: "Do not accept accounts with 'guest login' only."
            },
            {
                id: 2,
                step: "Ensure the seller does not have recovery access before making the final payment."
            }
        ]
    },
    {
        id: 2,
        game: "Dream League Soccer",
        steps: [
            {
                id: 201,
                step: "Get Seller's Login Details: Dream League Soccer uses Google Play or Apple Game Center for sync."
            },
            {
                id: 202,
                step: "Switch Google/Apple ID:",
                list: [
                    {
                        id: 1,
                        step: "On Android: Remove the seller’s Google Play account and sign in with yours."
                    },
                    {
                        id: 2,
                        step: "On iOS: Ensure Game Center is connected to your account instead of the seller’s."
                    }
                ]
            },
            {
                id: 203,
                step: "Resync Progress: Play a match and restart the game to ensure progress syncs with your credentials."
            }
        ],
        precautions: [
            {
                id: 1,
                step: "If linked to Facebook, unlink the previous owner's account before linking yours."
            },
            {
                id: 2,
                step: "Always restart the app after making changes to check ownership."
            }
        ]
    },
    {
        id: 3,
        game: "FIFA Ultimate Team (PlayStation & Mobile)",
        steps: [
            {
                id: 301,
                step: "Obtain EA Account Credentials: Ask the seller for their EA account login details."
            },
            {
                id: 302,
                step: "Change Email & Password:",
                list: [
                    {
                        id: 1,
                        step: "Log in to EA’s official website."
                    },
                    {
                        id: 2,
                        step: "Change the registered email and password."
                    }
                ]
            },
            {
                id: 303,
                step: "Unlink PlayStation/Xbox Account (if applicable):",
                list: [
                    {
                        id: 1,
                        step: "If linked to a console, remove the old PlayStation/Xbox association before adding your own."
                    }
                ]
            },
            {
                id: 304,
                step: "Verify Ownership: Try logging into FIFA Ultimate Team with your new credentials."
            }
        ],
        precautions: [
            {
                id: 1,
                step: "Make sure EA Support is not holding the account under review before purchasing."
            },
            {
                id: 2,
                step: "Always secure the account with 2FA after taking ownership."
            }
        ]
    },
    {
        id: 4,
        game: "Grand Theft Auto V (GTA Online - PlayStation & PC)",
        steps: [
            {
                id: 401,
                step: "Obtain Rockstar Social Club Login Details: The seller must provide full access to the linked Social Club account."
            },
            {
                id: 402,
                step: "Change Social Club Email & Password:",
                list: [
                    {
                        id: 1,
                        step: "Log into Rockstar’s website and update the email and password."
                    }
                ]
            },
            {
                id: 403,
                step: "Unlink Any Additional Platforms: If linked to PlayStation or Xbox, unlink the previous owner’s credentials and add yours."
            },
            {
                id: 404,
                step: "Verify Account Access: Log in on your console or PC to ensure ownership has transferred."
            }
        ],
        precautions: [
            {
                id: 1,
                step: "Do not purchase an account still tied to the seller’s email."
            },
            {
                id: 2,
                step: "Ensure all in-game purchases and progress remain intact before finalizing payment."
            }
        ]
    },
    {
        id: 5,
        game: "Fortnite (PlayStation, Xbox, Mobile & PC)",
        steps: [
            {
                id: 501,
                step: "Obtain Epic Games Login Details: Ensure the seller provides full email access."
            },
            {
                id: 502,
                step: "Change Email & Password:",
                list: [
                    {
                        id: 1,
                        step: "Log into Epic Games’ website and update credentials."
                    }
                ]
            },
            {
                id: 503,
                step: "Unlink Previous Console Accounts:",
                list: [
                    {
                        id: 1,
                        step: "Navigate to Epic Games’ 'Connected Accounts' section and unlink the seller’s PlayStation, Xbox, or Switch."
                    },
                    {
                        id: 2,
                        step: "Link your own console account to ensure ownership."
                    }
                ]
            },
            {
                id: 504,
                step: "Enable Two-Factor Authentication (2FA): This ensures extra security once ownership is transferred."
            }
        ],
        precautions: [
            {
                id: 1,
                step: "If an account is 'locked' due to multiple ownership transfers, contact Epic Support."
            },
            {
                id: 2,
                step: "Do not purchase accounts that are flagged as 'banned' or 'compromised'."
            }
        ]
    },
    {
        id: 6,
        game: "Apex Legends (PlayStation, Xbox & PC)",
        steps: [
            {
                id: 601,
                step: "Get EA Account Details: Ask the seller for their EA login."
            },
            {
                id: 602,
                step: "Change Email & Password:",
                list: [
                    {
                        id: 1,
                        step: "Log in to EA’s website and update the credentials."
                    }
                ]
            },
            {
                id: 603,
                step: "Unlink Console Accounts: If the seller’s account is linked to PlayStation/Xbox, unlink and replace it with yours."
            },
            {
                id: 604,
                step: "Verify the Account: Log into Apex Legends with your new details and ensure progress is intact."
            }
        ],
        precautions: [
            {
                id: 1,
                step: "Avoid accounts with previous bans or restrictions."
            },
            {
                id: 2,
                step: "Ensure the seller does not have recovery access before completing the transaction."
            }
        ]
    },
    {
        id: 7,
        game: "PUBG Mobile",
        steps: [
            {
                id: 701,
                step: "Obtain Seller’s Login Info: Ask for the account’s main login method (Twitter, Facebook, Google, or Apple ID)."
            },
            {
                id: 702,
                step: "Unlink Seller's Account: Go to PUBG Mobile’s settings and unlink any social accounts the seller used."
            },
            {
                id: 703,
                step: "Link Your Own: Connect your own Facebook, Twitter, or Google account."
            },
            {
                id: 704,
                step: "Secure the Account: Change any in-game display info like nickname and avatar to mark your ownership."
            }
        ],
        precautions: [
            {
                id: 1,
                step: "Some accounts may require waiting 30 days after unlinking before relinking to a new platform."
            },
            {
                id: 2,
                step: "Avoid guest accounts."
            }
        ]
    },
    {
        id: 8,
        game: "Free Fire",
        steps: [
            {
                id: 801,
                step: "Obtain Login Credentials: Free Fire accounts are usually linked to Facebook, VK, Google, or Apple ID."
            },
            {
                id: 802,
                step: "Unlink Old Account: Use the game’s account settings to unlink any seller information."
            },
            {
                id: 803,
                step: "Link Your New Account: Add your own Google, VK, or Facebook login."
            },
            {
                id: 804,
                step: "Test Access: Log in and confirm all skins, characters, and achievements are intact."
            }
        ],
        precautions: [
            {
                id: 1,
                step: "Guest accounts cannot be transferred."
            },
            {
                id: 2,
                step: "If the seller used Facebook or VK, ask them to remove the game from their app settings too."
            }
        ]
    }
]

export default gameDoc;