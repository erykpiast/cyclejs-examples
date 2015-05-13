/* global suite, test */
import { assert } from 'chai';

import fileManager from '../index';


suite('fileManager API test', () => {
    
    test('should be a function', () => {
        assert.isFunction(fileManager);
    });
    
});