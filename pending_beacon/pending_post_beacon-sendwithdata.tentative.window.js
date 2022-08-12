// META: script=/resources/testharness.js
// META: script=/resources/testharnessreport.js
// META: script=/common/utils.js
// META: script=./resources/pending_beacon-helper.js

'use strict';

// Test empty data.
for (const dataType in BeaconDataType) {
  postBeaconSendDataTest(
      dataType, '', `Sent empty ${dataType}, and server got no data.`, {
        expectNoData: true,
      });
}

// Test small payload.
for (const [dataType, skipCharset] of Object.entries(
         BeaconDataTypeToSkipCharset)) {
  postBeaconSendDataTest(
      dataType, generateSequentialData(0, 1024, skipCharset),
      'Encoded and sent in POST request.');
}

// Test large payload.
for (const dataType in BeaconDataType) {
  postBeaconSendDataTest(
      dataType, generatePayload(65536), 'Sent out big data.');
}

test(() => {
  const uuid = token();
  const url = generateSetBeaconURL(uuid);
  let beacon = new PendingPostBeacon(url);
  assert_throws_js(TypeError, () => beacon.setData(new ReadableStream()));
}, 'setData() does not support ReadableStream.');
