import { sayHello} from "../index";

test('Say Hello', () => {
  expect(sayHello('Tago')).toBe('Hello, Tago!');
});