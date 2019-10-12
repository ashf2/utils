export class color
{
    /** r 通道adasdad */
    r:number;
    /** * g通道 */
    g:number;
    /** * b通道sss */
    b:number;
    /** * a通道 */
    a:number;
    /** * 红色 */
    static readonly Red:color=new color(1,0,0,1);
 
    constructor(r:number=1,g:number,b:number=1,a:number=1)
    {
        this.r=r;
        this.g=g;
        this.b=b;
        this.a=a;
    }
    /**
     * 复制 color
     * @param from clone from
     * @returns 返回 new instanced Color
     */
    public static clone(from: color): color
    {
        let item=new color(from[0],from[1],from[2],from[3]);
        return item;
    }
 
    /**
     * Copy the values from one color to another
     *
     * @param out the receiving vector
     * @param a the source vector
     * @returns out
     */
    public static copy(a: color,out: color): color{
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        out[3] = a[3];
        return out;
    }
}