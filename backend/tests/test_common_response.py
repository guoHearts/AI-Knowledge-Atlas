from common.errors import AppError
from common.response import error_response, success_response


def test_success_response_wraps_data_with_request_id():
    response = success_response({"items": []}, request_id="req_test")

    assert response == {
        "success": True,
        "data": {"items": []},
        "message": "ok",
        "requestId": "req_test",
    }


def test_error_response_wraps_app_error_with_request_id():
    response = error_response(
        AppError(
            code="RADAR_ITEM_NOT_FOUND",
            message="Radar item not found",
            status_code=404,
            details={"itemId": "missing"},
        ),
        request_id="req_test",
    )

    assert response.status_code == 404
    assert response.body
    assert response.headers["content-type"] == "application/json"
    assert response.body.decode("utf-8") == (
        '{"success":false,"error":{"code":"RADAR_ITEM_NOT_FOUND",'
        '"message":"Radar item not found","details":{"itemId":"missing"}},'
        '"requestId":"req_test"}'
    )
