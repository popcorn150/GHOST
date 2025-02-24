const fetchCategories = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            import("../data/categories.json").then((data) => resolve(data.categories));
        }, 1000);
    });
};

const fetchAvailableAccounts = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            import("../data/availableAccounts.json").then((data) => resolve(data.availableAccounts));
        }, 1000);
    });
};

export { fetchCategories, fetchAvailableAccounts }
