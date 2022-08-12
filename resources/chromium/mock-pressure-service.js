import {PressureService, PressureServiceReceiver, PressureStatus, SetQuantizationStatus} from '/gen/third_party/blink/public/mojom/compute_pressure/pressure_service.mojom.m.js'

class MockPressureService {
  constructor() {
    this.observer_ = null;
    this.pressureState_ = null;
    this.pressureStatus_ = PressureStatus.kOk;
    this.quantizationStatus_ = SetQuantizationStatus.kChanged;

    this.receiver_ = new PressureServiceReceiver(this);
    this.interceptor_ =
        new MojoInterfaceInterceptor(PressureService.$interfaceName);
    this.interceptor_.oninterfacerequest = e => {
      this.receiver_.$.bindHandle(e.handle);
    };
  }

  start() {
    this.interceptor_.start();
  }

  stop() {
    this.interceptor_.stop();
  }

  async bindObserver(observer) {
    if (this.observer_ !== null)
      throw new Error('BindObserver() has already been called');

    this.observer_ = observer;

    return {status: this.pressureStatus_};
  }

  async setQuantization(quantization) {
    return {status: this.quantizationStatus_};
  }

  sendUpdate() {
    if (this.pressureState_ === null || this.observer_ === null)
      return;
    this.observer_.onUpdate(this.pressureState_);
  }

  resetObserver() {
    this.observer_ = null;
  }

  setPressureState(value) {
    this.pressureState_ = value;
  }

  setPressureStatus(status) {
    if (status === 'NotSupport')
      this.pressureStatus_ = PressureStatus.kNotSupported;
    else if (status === 'SecurityError')
      this.pressureStatus_ = PressureStatus.kSecurityError;
    else
      this.pressureStatus_ = PressureStatus.kOk;
  }

  setQuantizationStatus(status) {
    if (status === 'Invalid')
      this.quantizationStatus_ = SetQuantizationStatus.kInvalid;
    else if (status === 'Unchanged')
      this.quantizationStatus_ = SetQuantizationStatus.kUnchanged;
    else
      this.quantizationStatus_ = SetQuantizationStatus.kChanged;
  }
}

export const mockPressureService = new MockPressureService();
