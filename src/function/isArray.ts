/** 
 * @module type
*/

/**
  * 判断数据是不是数组类型的数据
  * 
  * @param value（必选）要判断是不是数组类型的数据'
  * @returns Boolean
  * 
  * #### 使用示例
  * ```typescript
  * 
  * let arr1 = [];
  * console.log(isArray(arr1));
  * ```
*/

export default function isArray(value:any) {
  return Object.prototype.toString.call(value) === "[object Array]"
}