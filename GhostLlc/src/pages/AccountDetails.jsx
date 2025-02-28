import { useParams } from "react-router-dom"
import availableAccounts from "../constants";
import categoryAccounts from "../constants/category";

const AccountDetails = () => {
    const { slug } = useParams();
    let account = availableAccounts.find((acc) => acc.slug === slug);

    if (!account) {
        for (const category of categoryAccounts) {
            const foundGame = category.games.find((game) => game.slug === slug);
            if (foundGame) {
                account = foundGame;
                break;
            }
        }
    }

    if (!account) {
        return <div className="text-center text-red-500">Account not found</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold">{account.title}</h1>
            <p className="text-gray-400">{account.views} Total Views</p>
            <img src={account.img} alt={account.title} className="w-full h-64 object-cover rounded-md mt-4" />
            <h2 className="text-xl font-semibold mt-6">Screenshots:</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {account.screenShots.map((shot) => (
                    <img key={shot.id} src={shot.img} alt="screenshot" className="w-full h-40 object-cover rounded-md" />
                ))}
            </div>
        </div>
    )
}

export default AccountDetails