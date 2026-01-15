def build_bar_chart(result_rows, dimension, value_key):
    labels = []
    values = []

    for row in result_rows:
        labels.append(row[dimension])
        values.append(row[value_key])

    return {
        "type": "bar",
        "data": {
            "labels": labels,
            "datasets": [
                {
                    "label": f"{value_key} by {dimension}",
                    "data": values
                }
            ]
        }
    }
