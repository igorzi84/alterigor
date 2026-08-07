import logging

LOG_FORMAT = "%(asctime)s %(levelname)s %(name)s %(message)s"


def configure_logging(log_level: str) -> None:
    """Configure application logging once during application startup."""
    logging.basicConfig(
        level=log_level.upper(),
        format=LOG_FORMAT,
    )


def get_logger(name: str) -> logging.Logger:
    """Return a logger for an application module."""
    return logging.getLogger(name)
