interface Some<T> {
    present: true
    value: T
}
interface None {
    present: false
    reason?: string
}

type Result<T> = Some<T> | None