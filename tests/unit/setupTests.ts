beforeEach(() => {
  if (typeof jest !== 'undefined') {
    jest.restoreAllMocks();
  }
});

afterEach(() => {
  if (typeof jest !== 'undefined') {
    jest.clearAllMocks();
    jest.resetAllMocks();
  }
});
