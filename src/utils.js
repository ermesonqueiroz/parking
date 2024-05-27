function ord(letter) {
    return Number(letter.charCodeAt(0) - 97);
}

export function initialsToNumber(initials) {
    return initials
        .toLowerCase()
        .split('')
        .reverse()
        .map((letter, index) => ord(letter) * (26 ** index))
        .reduce((acc, current) => acc + current, 0)
}

export function getPlateLabel(plateInitials, data) {
    const plateValue = initialsToNumber(plateInitials);

    return Object.entries(data)
        .find(([, intervals]) => {
            return intervals
                .map(interval => interval.map(initialsToNumber))
                .find(([start, end]) => {
                    console.log(start, end)
                    return plateValue >= start && plateValue <= end
                })
        })
        .at(0)
}
