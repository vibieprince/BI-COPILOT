import re

AGG_KEYWORDS = {
    "sum": ["total", "sum"],
    "mean": ["average", "avg", "mean"],
    "count": ["count", "number of", "how many"],
    "max": ["max", "maximum", "highest"],
    "min": ["min", "minimum", "lowest"]
}

def detect_operation(question: str):
    q = question.lower()
    for op, keys in AGG_KEYWORDS.items():
        for k in keys:
            if k in q:
                return op
    return None

def detect_dimension(question: str, columns):
    q = question.lower()
    for col in columns:
        if col.lower() in q:
            return col
    return None

def detect_metric(question: str, columns, dimension):
    q = question.lower()
    # choose a numeric-looking column mentioned in the question,
    # excluding the dimension
    for col in columns:
        if dimension and col == dimension:
            continue
        if col.lower() in q:
            return col
    return None
