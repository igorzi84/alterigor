import logging

from alterigor.observability.logging import get_logger


def test_logger_emits_message(caplog):
    logger = get_logger("alterigor.test")

    with caplog.at_level(logging.INFO, logger="alterigor.test"):
        logger.info("test event")

    assert "test event" in caplog.text
    assert "alterigor.test" in caplog.text