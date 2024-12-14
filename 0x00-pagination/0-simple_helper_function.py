#!/usr/bin/env python3
"""
index_range
"""
from typing import Tuple


def index_range(page: int, page_size: int) -> Tuple[int, int]:
    """
    return in a list for pagination parameters.
    Args:
        page: current page
        page_size: the amount of items in a page
    Returns:
        (tuple): a tuple of the start and end index for the given page
    """
    nxt = page * page_size
    return nxt - page_size, nxt
