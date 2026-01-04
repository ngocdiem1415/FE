export const formatToLocalTime = (serverTime: string | undefined) => {
    if (!serverTime) return "";

    const isoTime = serverTime.replace(" ", "T") + "Z";

    const date = new Date(isoTime);

    if (isNaN(date.getTime())) {
        return serverTime;
    }

    return new Intl.DateTimeFormat("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    }).format(date);
};