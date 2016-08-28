#Turbulence Style Guide

###Tests
All tests should be written in Spec-Style BDD.  The name of the files containing the tests should be `Test${ModuleName}.ts` and `IntegrationTest${ModuleName}.ts` for Unit and Integration Tests respectively.  For example, tests for a module `FileSystemAccessor` would be named `TestFileSystemAccessor` and `IntegrationTestFileSystemAccessor`.  For the purposes of this project, Unit Tests shall mean tests in which the application under test (AUT) does not access the file system or make network calls.  This does not preclude loading test data from the file system in the testing framework, but the AUT should have all I/O operations stubbed or mocked out.  Integration tests are all non-performance tests that do not meet the criteria for Unit Tests.

In all tests, the outermost `describe` block should contain only name of the module under test, with words separated by spaces.  For example, the tests for the module `FileSystemAccessor` would have a describe block as follows:
   
```javascript
   describe('File System Accessor', () => {  /* ... rest of file
```   

This format is the same for both Unit and Integration tests, so multiple types of tests for the same module would have identical outer describe blocks. 
