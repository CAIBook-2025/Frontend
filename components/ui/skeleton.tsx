function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={`animate-pulse rounded-md bg-muted/10 bg-gray-200 ${className || ''}`}
            {...props}
        />
    )
}

export { Skeleton }
