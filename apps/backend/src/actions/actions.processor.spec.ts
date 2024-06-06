describe('Actions processor', () => {
  it('should throw an error when not running as worker', () => {
    expect(() => require('./actions.processor')).toThrow();
  });
});
