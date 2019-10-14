import isArray from '../src/function/isArray';


describe('test toFixed', function(){
	test("object", function(){
		expect(isArray({})).toBe(false);
	});
	test("condition2", function(){
		expect(isArray([])).toBe(true);
	});
});