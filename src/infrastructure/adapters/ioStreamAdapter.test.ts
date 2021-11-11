import IoStreamAdapter from './ioStreamAdapter'

describe('IO Tests', () => {
    test("Should return 'Error: No such file!' if file does not exist.", () => {
        expect(() => {
            const filePath = '\\'
            new IoStreamAdapter(filePath);
        }).toThrow();
    })
});
