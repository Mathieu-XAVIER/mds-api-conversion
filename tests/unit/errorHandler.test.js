const { errorHandler } = require('../../src/controllers/index');

describe('Error Handler Middleware', () => {
  test('should return 500 status with error message in development mode', () => {
    // Mock environment
    process.env.NODE_ENV = 'development';
    
    // Mock request and response
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();
    
    // Mock error
    const error = new Error('Test error');
    
    // Call error handler
    errorHandler(error, req, res);
    
    // Verify response
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Erreur interne du serveur',
      message: 'Test error'
    });
  });
  
  test('should return 500 status without error message in production mode', () => {
    // Mock environment
    process.env.NODE_ENV = 'production';
    
    // Mock request and response
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();
    
    // Mock error
    const error = new Error('Test error');
    
    // Call error handler
    errorHandler(error, req, res);
    
    // Verify response
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Erreur interne du serveur',
      message: undefined
    });
    
    // Reset environment
    delete process.env.NODE_ENV;
  });
});