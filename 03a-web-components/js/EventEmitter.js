/**
 * EventEmitter — тот же класс что в v03-oop.
 * Паттерн Observer: объекты могут подписываться на события
 * и получать уведомления об изменениях.
 * 
 * В v04 (Vue) этот паттерн встроен в реактивную систему.
 * В v05 (React) заменён однонаправленным потоком данных.
 * Здесь — делаем вручную, как фундамент для Web Components.
 */
export class EventEmitter {
  constructor() {
    this._events = {};
  }

  on(event, listener) {
    if (!this._events[event]) {
      this._events[event] = [];
    }
    this._events[event].push(listener);
  }

  off(event, listener) {
    if (!this._events[event]) return;
    this._events[event] = this._events[event].filter(l => l !== listener);
  }

  emit(event, data) {
    if (!this._events[event]) return;
    this._events[event].forEach(listener => listener(data));
  }
}
