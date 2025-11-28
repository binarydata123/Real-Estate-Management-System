export const getInitial = (name?: string) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
};