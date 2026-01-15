def run_aggregation(df, operation, metric, dimension):
    if operation == "count":
        result = df.groupby(dimension).size().reset_index(name="count")
    else:
        grouped = df.groupby(dimension)[metric]
        if operation == "sum":
            result = grouped.sum().reset_index(name="sum")
        elif operation == "mean":
            result = grouped.mean().reset_index(name="mean")
        elif operation == "max":
            result = grouped.max().reset_index(name="max")
        elif operation == "min":
            result = grouped.min().reset_index(name="min")
        else:
            raise ValueError("Unsupported operation")

    return result
