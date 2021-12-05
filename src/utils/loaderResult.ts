export const loaderResult = <T>(d: T | Error): T => {
    if (d instanceof Error) throw d;
    else return d as T;
};
