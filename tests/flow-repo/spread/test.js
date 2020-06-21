function parseTimestamp(timestamp: string): number {
    return 0;
}

function parseCounter(line: string): number {
    return 0;
}

function parseGroup(lines: Array<string>): {
    counter: number;
    begin: number;
    end: number;
    text: string;
} {
    var counter = parseCounter(lines[0]);
    var timeframe = parseTimeframe(lines[1]);
    return {
        counter,
        ...timeframe,
        text: lines[2]
    };
}

function parseTimeframe(line: string): { begin: number; end: number } {
    var timestamps = line.split('-->');
    return {
        begin: parseTimestamp(timestamps[0].trim()),
        end: parseTimestamp(timestamps[1].trim())
    };
}
