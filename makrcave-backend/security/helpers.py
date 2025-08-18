"""Security helper utilities.

This module provides a simple request context store that can be used by
dependencies and middleware to access authentication information scoped to a
single request.
"""

from __future__ import annotations

from contextvars import ContextVar
from typing import Any, Dict

# Context variable storing request specific information.  The default is an
# empty dictionary so callers can freely update it without worrying about
# initialisation.
request_context: ContextVar[Dict[str, Any]] = ContextVar("request_context", default={})


def get_request_context() -> Dict[str, Any]:
    """Return the current request context."""
    return request_context.get()


def set_request_context(**kwargs: Any) -> None:
    """Update values in the request context.

    Only keys with non-``None`` values are written to avoid polluting the
    context with empty fields.
    """
    context = request_context.get().copy()
    for key, value in kwargs.items():
        if value is not None:
            context[key] = value
    request_context.set(context)
