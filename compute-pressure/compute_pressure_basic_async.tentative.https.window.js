// META: script=/resources/test-only-api.js
// META: script=resources/pressure-helpers.js

'use strict';

pressure_test(async (t, mockPressureService) => {
  const observer = new PressureObserver(() => {
    assert_unreached('The observer callback should not be called');
  });

  mockPressureService.setPressureState({cpuUtilization: 0.5});
  mockPressureService.setPressureStatus('NotSupport');
  await observer.observe('cpu').catch(
      e => assert_equals(e.message, 'Not available on this platform.'));
  mockPressureService.sendUpdate();

  return new Promise(resolve => {
    t.step_timeout(() => {
      resolve();
    }, 1000);
  });
}, 'Return kNotSupport when call observer()');

pressure_test((t, mockPressureService) => {
  mockPressureService.setPressureStatus('Ok');
  return new Promise(async resolve => {
           const observer1 = new PressureObserver(() => {});
           await observer1.observe('cpu');
           observer1.unobserve('cpu');
           mockPressureService.resetObserver();

           const observer2 = new PressureObserver(resolve);
           await observer2.observe('cpu');

           mockPressureService.setPressureState({cpuUtilization: 0.5});
           mockPressureService.sendUpdate();
         })
      .then(update => {
        assert_equals(update.cpuUtilization, 0.5);
      });
}, 'Basic functionality test');

pressure_test((t, mockPressureService) => {
  const observer = new PressureObserver(() => {
    assert_unreached('The observer callback should not be called');
  });

  mockPressureService.setPressureState({cpuUtilization: 0.5});
  observer.observe('cpu');
  observer.unobserve('cpu');
  mockPressureService.sendUpdate();

  return new Promise(resolve => {
    t.step_timeout(() => {
      resolve();
    }, 1000);
  });
}, 'Removing observer before observe() resolves works');

pressure_test(async (t, mockPressureService) => {
  const callbackPromises = [];
  const observePromises = [];

  mockPressureService.setQuantizationStatus('Unchanged');

  for (let i = 0; i < 2; i++) {
    callbackPromises.push(new Promise(resolve => {
      const observer = new PressureObserver(resolve);
      observePromises.push(observer.observe('cpu'));
    }));
  }

  await Promise.all(observePromises);

  mockPressureService.setPressureState({cpuUtilization: 0.5});
  mockPressureService.sendUpdate();

  return Promise.all(callbackPromises);
}, 'Calling observe() multiple times works');

pressure_test((t, mockPressureService) => {
  return new Promise(async resolve => {
           mockPressureService.setQuantizationStatus('Changed');
           const observer1 = new PressureObserver(resolve);
           await observer1.observe('cpu');

           mockPressureService.setQuantizationStatus('Unchanged');
           const observer2 = new PressureObserver(() => {});
           await observer2.observe('cpu');

           mockPressureService.setPressureState({cpuUtilization: 0.5});
           mockPressureService.sendUpdate();
         })
      .then(update => {
        assert_equals(update.cpuUtilization, 0.5);
      });
}, 'Same quantization should not stop other observers');

pressure_test(async (t, mockPressureService) => {
  mockPressureService.setQuantizationStatus('Changed');
  const observer1 = new PressureObserver(() => {
    assert_unreached('The observer callback should not be called');
  });
  await observer1.observe('cpu');

  const observer2 = new PressureObserver(() => {});
  await observer2.observe('cpu');

  return new Promise(resolve => {
    t.step_timeout(() => {
      resolve();
    }, 1000);
  });
}, 'Different quantization should stop other observers');
