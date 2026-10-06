# Live cURL Test Evidence

Base API URL: `https://campus-equipment-booking-api.tar127290.workers.dev/api`
Run time: 2026-10-06 07:51:14 UTC
Client: curl.exe from PowerShell. Status codes are checked by this script.

## List equipment — expected 200, actual 200

```text
curl.exe -i -X GET "https://campus-equipment-booking-api.tar127290.workers.dev/api/equipment"
HTTP/1.1 200 OK
Date: Tue, 06 Oct 2026 07:51:15 GMT
Content-Type: application/json
Content-Length: 115
Connection: keep-alive
Report-To: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=yhiL2s69hEvtxdzdjkh1uaxVSCSf1O45Kh6T9SV7iLi5X7U%2FVJp%2FBPnSOseotE%2BUDRR%2BYEOz2VVPbJHoWZpxU9iU%2FL1alN9nKEMmJks3n%2BucsdBoxF8jtazGsDRmMaFdto1zLYUqzEzzDv%2BWG5szA6azrjMLksjf5bI9semyyfYaI12eHw%3D%3D"}]}
Nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
Server: cloudflare
CF-RAY: a463146fdc3d8482-HKG
alt-svc: h3=":443"; ma=86400

[{"id":"eq-1","name":"Projector A","location":"Building 1"},{"id":"eq-2","name":"Camera B","location":"Media Lab"}]
CURL_STATUS:200
```

## List bookings — expected 200, actual 200

```text
curl.exe -i -X GET "https://campus-equipment-booking-api.tar127290.workers.dev/api/bookings"
HTTP/1.1 200 OK
Date: Tue, 06 Oct 2026 07:51:15 GMT
Content-Type: application/json
Content-Length: 2
Connection: keep-alive
Report-To: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=H48pP%2B%2FnD4sxrE8SZF2vEKcU6Z8idDEdExa1kEFs75vgyHRQObFMPVh3Y%2B6HgiK13dywPvEwuGAv05GxbivF%2BdhxIeXfa4BX6K8ecRXdee3lV2pkyk7%2Fg238OlezuUEfbgTe%2BRpIJEvTY602xqsfnkMdoysxT6EZK2lTZCVvXkA0o8mCcg%3D%3D"}]}
Nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
Server: cloudflare
CF-RAY: a4631473adf0e10a-SIN
alt-svc: h3=":443"; ma=86400

[]
CURL_STATUS:200
```

## Create booking — expected 201, actual 201

```text
curl.exe -i -X POST "https://campus-equipment-booking-api.tar127290.workers.dev/api/bookings" -H "Content-Type: application/json" --data-raw '{"endAt":"2026-11-07T18:47:14.753Z","startAt":"2026-11-07T16:47:14.753Z","borrowerName":"cURL Evidence Test","purpose":"Exam HTTP verification","equipmentId":"eq-1"}'
HTTP/1.1 201 Created
Date: Tue, 06 Oct 2026 07:51:16 GMT
Content-Type: application/json
Content-Length: 209
Connection: keep-alive
Report-To: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=ivvE6UnLfw2s1Z5U7z0h49GLA27lIx8S7AKvIbEzIX7%2Fj6psnl1FsmwtL1zmXfg5y4kM0GpekR6kk1E%2FFTJtUbOXGb3kydqbecoZKOknaicoeQfFPpkVq79KabcTv7wy5nYtEPkcwtLO6wBLO%2BcBemdEJeHoST0jjY6AoZyBwu9Uqqzy%2Fw%3D%3D"}]}
Nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
Server: cloudflare
CF-RAY: a46314798ffefcf8-SIN
alt-svc: h3=":443"; ma=86400

{"id":"94fec36b-1d2e-47ef-9ca5-410cdb0b05dc","equipmentId":"eq-1","borrowerName":"cURL Evidence Test","startAt":"2026-11-07T16:47:14.753Z","endAt":"2026-11-07T18:47:14.753Z","purpose":"Exam HTTP verification"}
CURL_STATUS:201
```

## Read booking — expected 200, actual 200

```text
curl.exe -i -X GET "https://campus-equipment-booking-api.tar127290.workers.dev/api/bookings/94fec36b-1d2e-47ef-9ca5-410cdb0b05dc"
HTTP/1.1 200 OK
Date: Tue, 06 Oct 2026 07:51:17 GMT
Content-Type: application/json
Content-Length: 209
Connection: keep-alive
Report-To: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=4KiSH%2FUTsQKagLgl5FU5SRli6yWUXWektTtiljPcrKXjWWj9Ym2t1MXCm38LtBDmtfH1oUABpbQHjBhu7QLi9iCZZTOe1OuzL2qmOikH%2Fgr3IhMZ8gmVvwvdIZmkBPoI8M1XmOhjPkouvlgM7Nurb1TCHCXiFUH42rUiQsd3EvWKaqIEOA%3D%3D"}]}
Nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
Server: cloudflare
CF-RAY: a463147c7aa6fd97-SIN
alt-svc: h3=":443"; ma=86400

{"id":"94fec36b-1d2e-47ef-9ca5-410cdb0b05dc","equipmentId":"eq-1","borrowerName":"cURL Evidence Test","startAt":"2026-11-07T16:47:14.753Z","endAt":"2026-11-07T18:47:14.753Z","purpose":"Exam HTTP verification"}
CURL_STATUS:200
```

## Update booking — expected 200, actual 200

```text
curl.exe -i -X PATCH "https://campus-equipment-booking-api.tar127290.workers.dev/api/bookings/94fec36b-1d2e-47ef-9ca5-410cdb0b05dc" -H "Content-Type: application/json" --data-raw '{"endAt":"2026-11-07T21:47:14.753Z","startAt":"2026-11-07T19:47:14.753Z","purpose":"Updated exam HTTP verification"}'
HTTP/1.1 200 OK
Date: Tue, 06 Oct 2026 07:51:17 GMT
Content-Type: application/json
Content-Length: 217
Connection: keep-alive
Report-To: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=Imq2ssVnqIzQOvOMBlJ04eE1P2iNhr9zXHZ9BTkDVFFVmxnXaIvlgezTSW7awAIhcvFbEN5dOBZWdWV4i9VB3ZUx7uLtKieEK%2BPA1E2M5w%2BxAy905a0oYCzYZvkLEdHGO5skfd3kM7jNznGH9ib6Wz0IO0Lv42lvw6WquQTVITU2L54Cew%3D%3D"}]}
Nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
Server: cloudflare
CF-RAY: a463147fad78cdf5-SIN
alt-svc: h3=":443"; ma=86400

{"id":"94fec36b-1d2e-47ef-9ca5-410cdb0b05dc","equipmentId":"eq-1","borrowerName":"cURL Evidence Test","startAt":"2026-11-07T19:47:14.753Z","endAt":"2026-11-07T21:47:14.753Z","purpose":"Updated exam HTTP verification"}
CURL_STATUS:200
```

## Invalid time range — expected 400, actual 400

```text
curl.exe -i -X POST "https://campus-equipment-booking-api.tar127290.workers.dev/api/bookings" -H "Content-Type: application/json" --data-raw '{"endAt":"2026-11-07T16:47:14.753Z","startAt":"2026-11-07T16:47:14.753Z","borrowerName":"Invalid","purpose":"Invalid time test","equipmentId":"eq-1"}'
HTTP/1.1 400 Bad Request
Date: Tue, 06 Oct 2026 07:51:18 GMT
Content-Type: application/json
Content-Length: 40
Connection: keep-alive
Report-To: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=ff9A32%2FS9ZB%2Bn%2BJek%2B%2BJLLQfNfhfivgY3aMOipdBm7C%2BJJCm4AqtncV7%2BFMqcVThSFtMzmvV%2BPes0pLPXTErSPIT8tdyxoqQM8W6T2aTWJ1wYh97gL9l9HMD5gA3PXz6Qtk%2Bn9H5TjRfJv658Dtpioery2YvBoqgl3Q3CsFro5J8f%2F%2B2WQ%3D%3D"}]}
Nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
Server: cloudflare
CF-RAY: a46314859cbbce69-SIN
alt-svc: h3=":443"; ma=86400

{"error":"startAt must be before endAt"}
CURL_STATUS:400
```

## Overlapping booking — expected 409, actual 409

```text
curl.exe -i -X POST "https://campus-equipment-booking-api.tar127290.workers.dev/api/bookings" -H "Content-Type: application/json" --data-raw '{"endAt":"2026-11-07T22:47:14.753Z","startAt":"2026-11-07T20:47:14.753Z","borrowerName":"Conflict","purpose":"Conflict test","equipmentId":"eq-1"}'
HTTP/1.1 409 Conflict
Date: Tue, 06 Oct 2026 07:51:19 GMT
Content-Type: application/json
Content-Length: 59
Connection: keep-alive
Report-To: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=s4yEIeSlhmqzR8g5z7KK9X2S8%2Fqxaah%2BKETXNF4%2FpJo1PFO1wyJz1hIwdhW4X1oz2aTU5IFB6Pk4LVL0qACUKpw4QyIoJ19hFVJug3SNT2oYYB5%2FdxGgDfRveN61hcKewxzqH04%2BmAOB7yzJ%2FksRu1VtwFQsX25MWYOa1fknEw7dJUlZGA%3D%3D"}]}
Nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
Server: cloudflare
CF-RAY: a4631486eb44ff81-SIN
alt-svc: h3=":443"; ma=86400

{"error":"Booking time conflicts with an existing booking"}
CURL_STATUS:409
```

## Missing equipment — expected 404, actual 404

```text
curl.exe -i -X POST "https://campus-equipment-booking-api.tar127290.workers.dev/api/bookings" -H "Content-Type: application/json" --data-raw '{"endAt":"2026-11-07T18:47:14.753Z","startAt":"2026-11-07T16:47:14.753Z","borrowerName":"Missing equipment","purpose":"Missing equipment test","equipmentId":"does-not-exist"}'
HTTP/1.1 404 Not Found
Date: Tue, 06 Oct 2026 07:51:19 GMT
Content-Type: application/json
Content-Length: 31
Connection: keep-alive
Report-To: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=RPN3QTyeHDcM%2ByGeE409a%2BLynUGYcoFZGI5hFG5LSqnwN82i5xStcL5bCJCNqwafwN2j6M68Tixe9yUtIYH32C9zNJgjA1kliKYw0CveEiQS5%2FRjZDQgOfq3hFRnoBvm1O094vsmhOo7F0jm2rQRlr0Ut3EPEZkgSIyNLVef3jnvOMP5GQ%3D%3D"}]}
Nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
Server: cloudflare
CF-RAY: a46314892e098a13-SIN
alt-svc: h3=":443"; ma=86400

{"error":"Equipment not found"}
CURL_STATUS:404
```

## Missing booking — expected 404, actual 404

```text
curl.exe -i -X GET "https://campus-equipment-booking-api.tar127290.workers.dev/api/bookings/not-found"
HTTP/1.1 404 Not Found
Date: Tue, 06 Oct 2026 07:51:19 GMT
Content-Type: application/json
Content-Length: 29
Connection: keep-alive
Report-To: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=uH4uIm1Ni00I%2BvLT4EL5QLBwHT%2F8ejB8MVO940pjJn5g7Djl6jm%2B2Bfz3i0Btl1LuDOkkVBizLU%2FrozyJ%2FMK0fptu2hRMw7pLg0p3L2%2BI1q28JLqk6aYR15W7Jkwd18ovtw0uUsgbixO9tnwABd7m6VioRX7UjPQ7XwBtQ%2BwRyW67FIOmg%3D%3D"}]}
Nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
Server: cloudflare
CF-RAY: a463148b2d889ccf-SIN
alt-svc: h3=":443"; ma=86400

{"error":"Booking not found"}
CURL_STATUS:404
```

## Delete booking — expected 204, actual 204

```text
curl.exe -i -X DELETE "https://campus-equipment-booking-api.tar127290.workers.dev/api/bookings/94fec36b-1d2e-47ef-9ca5-410cdb0b05dc"
HTTP/1.1 204 No Content
Date: Tue, 06 Oct 2026 07:51:20 GMT
Connection: keep-alive
Report-To: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=1pP0PpP7McWHTavXscDnMTLh8zh1ZDDX8KywW8OiEUzXoRl93Lku6n6wJMn%2BiAX%2BlOmvAys4P8pAoQIR7X9UpVIIhYRJYpXY1%2FVlhhYyDSl1%2BBzQrim2De6gjidj1y9T7bU3DjQsUpe3rHy0mMYuk2DjO%2BBza8QZbEepIZ6ntwam53rweA%3D%3D"}]}
Nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
Server: cloudflare
CF-RAY: a463148d9b6bc619-HKG
alt-svc: h3=":443"; ma=86400


CURL_STATUS:204
```

## Confirm deletion — expected 404, actual 404

```text
curl.exe -i -X GET "https://campus-equipment-booking-api.tar127290.workers.dev/api/bookings/94fec36b-1d2e-47ef-9ca5-410cdb0b05dc"
HTTP/1.1 404 Not Found
Date: Tue, 06 Oct 2026 07:51:20 GMT
Content-Type: application/json
Content-Length: 29
Connection: keep-alive
Report-To: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=88GRfBF%2F2moWS10eDpqX853mAOhJyFI9NmqQAzjtM4DKMEQv1vmcEbmtHhn1hlBrBP7a3HlqfRGvBc%2FxbFUp9ZLWijjXV6NwxCPgj5zmvF8IC6kGiLHDpIazBbxm3FUCJTY3trIAMJoiRANUF1MYLbg0DwA%2Bv9rv6M03pqy4wFnlUG47BA%3D%3D"}]}
Nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
Server: cloudflare
CF-RAY: a46314911d2e11e1-HKG
alt-svc: h3=":443"; ma=86400

{"error":"Booking not found"}
CURL_STATUS:404
```

