export enum ItineraryStatus {
    // all info is provided and all bols are complete
    Complete = 'Complete',

    // all info is provided, but all bols are still pending
    Pending = 'Pending',

    // all info is provided, but at least one bol is not complete
    InProgress = 'InProgress',

    // not enough info provided, needs attention
    Incomplete = 'Incomplete',
}
