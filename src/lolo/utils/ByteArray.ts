namespace lolo {


    /**
     * Endian 类中包含一些值，表示多字节数字的字节顺序。
     */
    export class Endian {
        /**最低有效字节 位于 字节序列 的最前面*/
        public static LITTLE_ENDIAN: string = "littleEndian";
        /**最高有效字节 位于 字节序列 的最前面*/
        public static BIG_ENDIAN: string = "bigEndian";
    }


    /**
     * ByteArray（字节数组）类提供用于优化读取、写入以及处理二进制数据（ArrayBuffer）的方法和属性
     * @author LOLO
     */
    export class ByteArray {

        private static SIZE_OF_BOOLEAN: number = 1;
        private static SIZE_OF_INT8: number = 1;
        private static SIZE_OF_INT16: number = 2;
        private static SIZE_OF_INT32: number = 4;
        private static SIZE_OF_UINT8: number = 1;
        private static SIZE_OF_UINT16: number = 2;
        private static SIZE_OF_UINT32: number = 4;
        private static SIZE_OF_FLOAT32: number = 4;
        private static SIZE_OF_FLOAT64: number = 8;

        private static BUFFER_EXT_SIZE: number = 0;// Buffer expansion size

        private _data: DataView;
        private _position: number;
        private _write_position: number;

        /**字节顺序。Endian.BIG_ENDIAN（默认） 或 Endian.LITTLE_ENDIAN*/
        public endian: string;


        constructor(buffer?: ArrayBuffer) {
            this.endian = Endian.BIG_ENDIAN;
            this.setArrayBuffer(buffer || new ArrayBuffer(ByteArray.BUFFER_EXT_SIZE));
        }


        /**
         * 获取或设置对应的 ArrayBuffer
         */
        public set buffer(value: ArrayBuffer) {
            this._data = new DataView(value);
        }

        public get buffer(): ArrayBuffer {
            return this._data.buffer;
        }

        private setArrayBuffer(buffer: ArrayBuffer): void {
            this._position = 0;
            this._write_position = buffer.byteLength;
            this._data = new DataView(buffer);
        }


        /**
         * 获取或设置对应的 DataView
         */
        public set dataView(value: DataView) {
            this._position = 0;
            this._write_position = value.byteLength;
            this._data = value;
        }

        public get dataView(): DataView {
            return this._data;
        }


        /**
         * 当前字节位置。下一次调用读取方法时将在此位置开始读取，或者下一次调用写入方法时将在此位置开始写入。
         */
        public set position(value: number) {
            this._position = value;
            this._write_position = value > this._write_position ? value : this._write_position;
        }

        public get position(): number {
            return this._position;
        }


        /**
         * ByteArray 对象的长度（以字节为单位）。
         * 如果将长度设置为大于当前长度的值，则用零填充字节数组的右侧。
         * 如果将长度设置为小于当前长度的值，将会截断该字节数组。
         */
        public get length(): number {
            return this._write_position;
        }

        public set length(value: number) {
            this._write_position = value;
            let tmp: Uint8Array = new Uint8Array(new ArrayBuffer(value));
            let byteLength: number = this._data.buffer.byteLength;
            if (byteLength > value) {
                this._position = value;
            }
            let length: number = Math.min(byteLength, value);
            tmp.set(new Uint8Array(this._data.buffer, 0, length));
            this.buffer = tmp.buffer;
        }


        /**
         * 可从字节数组的当前位置到数组末尾读取的数据的字节数。
         * 每次访问 ByteArray 对象时，将 bytesAvailable 属性与读取方法结合使用，以确保读取有效的数据。
         */
        public get bytesAvailable(): number {
            return this._data.byteLength - this._position;
        }


        /**
         * 清除字节数组的内容，并将 length 和 position 属性重置为 0。 
         */
        public clear(): void {
            this.setArrayBuffer(new ArrayBuffer(ByteArray.BUFFER_EXT_SIZE));
        }


        //


        /**
         * 从字节流中读取布尔值。读取单个字节，如果字节非零，则返回 true，否则返回 false
         */
        public readBoolean(): boolean {
            if (!this.validate(ByteArray.SIZE_OF_BOOLEAN)) return null;

            return this._data.getUint8(this._position++) != 0;
        }

        /**
         * 从字节流中读取带符号的字节
         * @return 介于 -128 和 127 之间的整数
         */
        public readByte(): number {
            if (!this.validate(ByteArray.SIZE_OF_INT8)) return null;

            return this._data.getInt8(this._position++);
        }

        /**
         * 从字节流中读取 length 参数指定的数据字节数。从 offset 指定的位置开始，将字节读入 bytes 参数指定的 ByteArray 对象中，并将字节写入目标 ByteArray 中
         * @param bytes 要将数据读入的 ByteArray 对象
         * @param offset bytes 中的偏移（位置），应从该位置写入读取的数据
         * @param length 要读取的字节数。默认值 0 导致读取所有可用的数据
         */
        public readBytes(bytes: ByteArray, offset: number = 0, length: number = 0): void {
            if (length == 0) {
                length = this.bytesAvailable;
            }
            else if (!this.validate(length)) {
                return null;
            }
            if (bytes) {
                bytes.validateBuffer(offset + length);
            }
            else {
                bytes = new ByteArray(new ArrayBuffer(offset + length));
            }

            // This method is expensive
            for (let i = 0; i < length; i++) {
                bytes._data.setUint8(i + offset, this._data.getUint8(this._position++));
            }
        }

        /**
         * 从字节流中读取一个 IEEE 754 双精度（64 位）浮点数
         * @return 双精度（64 位）浮点数
         */
        public readDouble(): number {
            if (!this.validate(ByteArray.SIZE_OF_FLOAT64)) return null;

            let value: number = this._data.getFloat64(this._position, this.endian == Endian.LITTLE_ENDIAN);
            this.position += ByteArray.SIZE_OF_FLOAT64;
            return value;
        }

        /**
         * 从字节流中读取一个 IEEE 754 单精度（32 位）浮点数
         * @return 单精度（32 位）浮点数
         */
        public readFloat(): number {
            if (!this.validate(ByteArray.SIZE_OF_FLOAT32)) return null;

            let value: number = this._data.getFloat32(this._position, this.endian == Endian.LITTLE_ENDIAN);
            this.position += ByteArray.SIZE_OF_FLOAT32;
            return value;
        }

        /**
         * 从字节流中读取一个带符号的 32 位整数
         * @return 介于 -2147483648 和 2147483647 之间的 32 位带符号整数
         */
        public readInt(): number {
            if (!this.validate(ByteArray.SIZE_OF_INT32)) return null;

            let value = this._data.getInt32(this._position, this.endian == Endian.LITTLE_ENDIAN);
            this.position += ByteArray.SIZE_OF_INT32;
            return value;
        }

        /**
         * 从字节流中读取一个带符号的 16 位整数
         * @return 介于 -32768 和 32767 之间的 16 位带符号整数
         */
        public readShort(): number {
            if (!this.validate(ByteArray.SIZE_OF_INT16)) return null;

            let value = this._data.getInt16(this._position, this.endian == Endian.LITTLE_ENDIAN);
            this.position += ByteArray.SIZE_OF_INT16;
            return value;
        }

        /**
         * 从字节流中读取无符号的字节
         * @return 介于 0 和 255 之间的 32 位无符号整数
         */
        public readUnsignedByte(): number {
            if (!this.validate(ByteArray.SIZE_OF_UINT8)) return null;

            return this._data.getUint8(this.position++);
        }

        /**
         * 从字节流中读取一个无符号的 32 位整数
         * @return 介于 0 和 4294967295 之间的 32 位无符号整数
         */
        public readUnsignedInt(): number {
            if (!this.validate(ByteArray.SIZE_OF_UINT32)) return null;

            let value = this._data.getUint32(this._position, this.endian == Endian.LITTLE_ENDIAN);
            this.position += ByteArray.SIZE_OF_UINT32;
            return value;
        }

        /**
         * 从字节流中读取一个无符号的 16 位整数
         * @return 介于 0 和 65535 之间的 16 位无符号整数
         */
        public readUnsignedShort(): number {
            if (!this.validate(ByteArray.SIZE_OF_UINT16)) return null;

            let value = this._data.getUint16(this._position, this.endian == Endian.LITTLE_ENDIAN);
            this.position += ByteArray.SIZE_OF_UINT16;
            return value;
        }

        /**
         * 从字节流中读取一个 UTF-8 字符串。假定字符串的前缀是无符号的短整型（以字节表示长度）
         * @return UTF-8 编码的字符串
         */
        public readUTF(): string {
            if (!this.validate(ByteArray.SIZE_OF_UINT16)) return null;

            let length: number = this._data.getUint16(this._position, this.endian == Endian.LITTLE_ENDIAN);
            this.position += ByteArray.SIZE_OF_UINT16;

            if (length > 0) {
                return this.readUTFBytes(length);
            } else {
                return "";
            }
        }

        /**
         * 从字节流中读取一个由 length 参数指定的 UTF-8 字节序列，并返回一个字符串
         * @param length UTF-8 字节长度。默认值：0 = bytesAvailable
         * @return 由指定长度的 UTF-8 字节组成的字符串
         */
        public readUTFBytes(length: number = 0): string {
            if (length == 0) length = this.bytesAvailable;
            if (!this.validate(length)) return null;

            let bytes: Uint8Array = new Uint8Array(this.buffer, this._data.byteOffset + this._position, length);
            this.position += length;
            return ByteArray.decodeUTF8(bytes);
        }

        // /**
        // * 使用指定的字符集从字节流中读取指定长度的多字节字符串
        // * @param length 要从字节流中读取的字节数
        // * @param charSet 表示用于解释字节的字符集的字符串。可能的字符集字符串包括 "shift-jis"、"cn-gb"、"iso-8859-1"”等
        // * @return UTF-8 编码的字符串
        // */
        // public readMultiByte(length:number, charSet?:string):string {
        // }


        //


        /**
         * 写入布尔值（根据 value 参数写入单个字节）
         * @param value 如果为 true，则写入 1，如果为 false，则写入 0
         */
        public writeBoolean(value: boolean): void {
            this.validateBuffer(ByteArray.SIZE_OF_BOOLEAN);

            this._data.setUint8(this.position++, value ? 1 : 0);
        }

        /**
         * 在字节流中写入一个字节
         * 使用参数的低 8 位。忽略高 24 位
         * @param value 一个 32 位整数。低 8 位将被写入字节流
         */
        public writeByte(value: number): void {
            this.validateBuffer(ByteArray.SIZE_OF_INT8);

            this._data.setInt8(this.position++, value);
        }

        /**
         * 将指定字节数组 bytes（起始偏移量为 offset，从零开始的索引）中包含 length 个字节的字节序列写入字节流
         * 如果省略 length 参数，则使用默认长度 0；该方法将从 offset 开始写入整个缓冲区。如果还省略了 offset 参数，则写入整个缓冲区
         * 如果 offset 或 length 超出范围，它们将被锁定到 bytes 数组的开头和结尾
         * @param bytes ByteArray 对象
         * @param offset 从 0 开始的索引，表示在数组中开始写入的位置
         * @param length 一个无符号整数，表示在缓冲区中的写入范围
         */
        public writeBytes(bytes: ByteArray, offset: number = 0, length: number = 0): void {
            let writeLength: number;
            if (offset < 0) {
                return;
            }
            if (length < 0) {
                return;
            }
            else if (length == 0) {
                writeLength = bytes.length - offset;
            }
            else {
                writeLength = Math.min(bytes.length - offset, length);
            }
            if (writeLength > 0) {
                this.validateBuffer(writeLength);

                let tmp_data = new DataView(bytes.buffer);
                let length = writeLength;
                let BYTES_OF_UINT32 = 4;
                for (; length > BYTES_OF_UINT32; length -= BYTES_OF_UINT32) {
                    this._data.setUint32(this._position, tmp_data.getUint32(offset));
                    this.position += BYTES_OF_UINT32;
                    offset += BYTES_OF_UINT32;
                }
                for (; length > 0; length--) {
                    this._data.setUint8(this.position++, tmp_data.getUint8(offset++));
                }
            }
        }

        /**
         * 在字节流中写入一个 IEEE 754 双精度（64 位）浮点数
         * @param value 双精度（64 位）浮点数
         */
        public writeDouble(value: number): void {
            this.validateBuffer(ByteArray.SIZE_OF_FLOAT64);

            this._data.setFloat64(this._position, value, this.endian == Endian.LITTLE_ENDIAN);
            this.position += ByteArray.SIZE_OF_FLOAT64;
        }

        /**
         * 在字节流中写入一个 IEEE 754 单精度（32 位）浮点数
         * @param value 单精度（32 位）浮点数
         */
        public writeFloat(value: number): void {
            this.validateBuffer(ByteArray.SIZE_OF_FLOAT32);

            this._data.setFloat32(this._position, value, this.endian == Endian.LITTLE_ENDIAN);
            this.position += ByteArray.SIZE_OF_FLOAT32;
        }

        /**
         * 在字节流中写入一个带符号的 32 位整数
         * @param value 要写入字节流的整数
         */
        public writeInt(value: number): void {
            this.validateBuffer(ByteArray.SIZE_OF_INT32);

            this._data.setInt32(this._position, value, this.endian == Endian.LITTLE_ENDIAN);
            this.position += ByteArray.SIZE_OF_INT32;
        }

        /**
         * 在字节流中写入一个 16 位整数。使用参数的低 16 位。忽略高 16 位
         * @param value 32 位整数，该整数的低 16 位将被写入字节流
         */
        public writeShort(value: number): void {
            this.validateBuffer(ByteArray.SIZE_OF_INT16);

            this._data.setInt16(this._position, value, this.endian == Endian.LITTLE_ENDIAN);
            this.position += ByteArray.SIZE_OF_INT16;
        }


        /**
         * 在字节流中写入一个无符号的 32 位整数
         * @param value 要写入字节流的无符号整数
         */
        public writeUnsignedInt(value: number): void {
            this.validateBuffer(ByteArray.SIZE_OF_UINT32);

            this._data.setUint32(this._position, value, this.endian == Endian.LITTLE_ENDIAN);
            this.position += ByteArray.SIZE_OF_UINT32;
        }

        /**
         * 在字节流中写入一个无符号的 16 位整数
         * @param value 要写入字节流的无符号整数
         */
        public writeUnsignedShort(value: number): void {
            this.validateBuffer(ByteArray.SIZE_OF_UINT16);

            this._data.setUint16(this._position, value, this.endian == Endian.LITTLE_ENDIAN);
            this.position += ByteArray.SIZE_OF_UINT16;
        }

        /**
         * 将 UTF-8 字符串写入字节流。先写入以字节表示的 UTF-8 字符串长度（作为 16 位整数），然后写入表示字符串字符的字节
         * @param value 要写入的字符串值
         */
        public writeUTF(value: string): void {
            let utf8bytes: Uint8Array = ByteArray.encodeUTF8(value);
            let length: number = utf8bytes.length;

            this.validateBuffer(ByteArray.SIZE_OF_UINT16 + length);

            this._data.setUint16(this._position, length, this.endian == Endian.LITTLE_ENDIAN);
            this.position += ByteArray.SIZE_OF_UINT16;
            this.writeUint8Array(utf8bytes, false);
        }


        /**
         * 将 UTF-8 字符串写入字节流。类似于 writeUTF() 方法，但 writeUTFBytes() 不使用 16 位长度的词为字符串添加前缀
         * @param value 要写入的字符串值
         */
        public writeUTFBytes(value: string): void {
            this.writeUint8Array(ByteArray.encodeUTF8(value));
        }


        //


        /**
         * 将 Uint8Array 写入字节流
         * @param bytes 要写入的Uint8Array
         * @param validateBuffer
         */
        private writeUint8Array(bytes: Uint8Array, validateBuffer: boolean = true): void {
            if (validateBuffer) {
                this.validateBuffer(this._position + bytes.length);
            }

            for (let i = 0; i < bytes.length; i++) {
                this._data.setUint8(this.position++, bytes[i]);
            }
        }

        /**
         * 指定长度的数据是否可以读取
         * @param len
         */
        public validate(len: number): boolean {
            return this._data.byteLength > 0 && this._position + len <= this._data.byteLength;
        }


        //


        private validateBuffer(len: number, needReplace: boolean = false): void {
            this._write_position = len > this._write_position ? len : this._write_position;
            len += this._position;
            if (this._data.byteLength < len || needReplace) {
                let tmp: Uint8Array = new Uint8Array(new ArrayBuffer(len + ByteArray.BUFFER_EXT_SIZE));
                let length = Math.min(this._data.buffer.byteLength, len + ByteArray.BUFFER_EXT_SIZE);
                tmp.set(new Uint8Array(this._data.buffer, 0, length));
                this.buffer = tmp.buffer;
            }
        }


        private static encodeUTF8(str: string): Uint8Array {
            let pos: number = 0;
            let codePoints = ByteArray.stringToCodePoints(str);
            let outputBytes = [];

            while (codePoints.length > pos) {
                let code_point: number = codePoints[pos++];

                if (ByteArray.inRange(code_point, 0xD800, 0xDFFF)) {
                    throwError("ByteArray.encodeUTF8()，", code_point, ":", str);
                }
                else if (ByteArray.inRange(code_point, 0x0000, 0x007f)) {
                    outputBytes.push(code_point);
                } else {
                    let count, offset;
                    if (ByteArray.inRange(code_point, 0x0080, 0x07FF)) {
                        count = 1;
                        offset = 0xC0;
                    } else if (ByteArray.inRange(code_point, 0x0800, 0xFFFF)) {
                        count = 2;
                        offset = 0xE0;
                    } else if (ByteArray.inRange(code_point, 0x10000, 0x10FFFF)) {
                        count = 3;
                        offset = 0xF0;
                    }

                    outputBytes.push(ByteArray.div(code_point, Math.pow(64, count)) + offset);

                    while (count > 0) {
                        let temp = ByteArray.div(code_point, Math.pow(64, count - 1));
                        outputBytes.push(0x80 + (temp % 64));
                        count -= 1;
                    }
                }
            }
            return new Uint8Array(outputBytes);
        }


        private static decodeUTF8(data: Uint8Array): string {
            let fatal: boolean = false;
            let pos: number = 0;
            let result: string = "";
            let code_point: number;
            let utf8_code_point = 0;
            let utf8_bytes_needed = 0;
            let utf8_bytes_seen = 0;
            let utf8_lower_boundary = 0;

            while (data.length > pos) {
                let _byte = data[pos++];

                if (_byte == -1) {
                    if (utf8_bytes_needed != 0) {
                        code_point = ByteArray.decoderError(fatal);
                    } else {
                        code_point = -1;
                    }
                }
                else {
                    if (utf8_bytes_needed == 0) {
                        if (ByteArray.inRange(_byte, 0x00, 0x7F)) {
                            code_point = _byte;
                        } else {
                            if (ByteArray.inRange(_byte, 0xC2, 0xDF)) {
                                utf8_bytes_needed = 1;
                                utf8_lower_boundary = 0x80;
                                utf8_code_point = _byte - 0xC0;
                            } else if (ByteArray.inRange(_byte, 0xE0, 0xEF)) {
                                utf8_bytes_needed = 2;
                                utf8_lower_boundary = 0x800;
                                utf8_code_point = _byte - 0xE0;
                            } else if (ByteArray.inRange(_byte, 0xF0, 0xF4)) {
                                utf8_bytes_needed = 3;
                                utf8_lower_boundary = 0x10000;
                                utf8_code_point = _byte - 0xF0;
                            } else {
                                ByteArray.decoderError(fatal);
                            }
                            utf8_code_point = utf8_code_point * Math.pow(64, utf8_bytes_needed);
                            code_point = null;
                        }
                    } else if (!ByteArray.inRange(_byte, 0x80, 0xBF)) {
                        utf8_code_point = 0;
                        utf8_bytes_needed = 0;
                        utf8_bytes_seen = 0;
                        utf8_lower_boundary = 0;
                        pos--;
                        code_point = ByteArray.decoderError(fatal, _byte);
                    } else {

                        utf8_bytes_seen += 1;
                        utf8_code_point = utf8_code_point + (_byte - 0x80) * Math.pow(64, utf8_bytes_needed - utf8_bytes_seen);

                        if (utf8_bytes_seen !== utf8_bytes_needed) {
                            code_point = null;
                        } else {

                            let cp = utf8_code_point;
                            let lower_boundary = utf8_lower_boundary;
                            utf8_code_point = 0;
                            utf8_bytes_needed = 0;
                            utf8_bytes_seen = 0;
                            utf8_lower_boundary = 0;
                            if (ByteArray.inRange(cp, lower_boundary, 0x10FFFF) && !ByteArray.inRange(cp, 0xD800, 0xDFFF)) {
                                code_point = cp;
                            } else {
                                code_point = ByteArray.decoderError(fatal, _byte);
                            }
                        }

                    }
                }
                // Decode string
                if (code_point !== null && code_point !== -1) {
                    if (code_point <= 0xFFFF) {
                        if (code_point > 0) result += String.fromCharCode(code_point);
                    } else {
                        code_point -= 0x10000;
                        result += String.fromCharCode(0xD800 + ((code_point >> 10) & 0x3ff));
                        result += String.fromCharCode(0xDC00 + (code_point & 0x3ff));
                    }
                }
            }
            return result;
        }


        //


        private static decoderError(fatal, opt_code_point?): number {
            if (fatal) {
                throwError("ByteArray.decoderError()，", fatal, ":", opt_code_point);
            }
            return opt_code_point || 0xFFFD;
        }

        private static inRange(a, min, max) {
            return min <= a && a <= max;
        }

        private static div(n, d) {
            return Math.floor(n / d);
        }

        private static stringToCodePoints(string) {
            let cps = [];
            // Based on http://www.w3.org/TR/WebIDL/#idl-DOMString
            let i = 0, n = string.length;
            while (i < string.length) {
                let c = string.charCodeAt(i);
                if (!ByteArray.inRange(c, 0xD800, 0xDFFF)) {
                    cps.push(c);
                } else if (ByteArray.inRange(c, 0xDC00, 0xDFFF)) {
                    cps.push(0xFFFD);
                } else { // (inRange(c, 0xD800, 0xDBFF))
                    if (i == n - 1) {
                        cps.push(0xFFFD);
                    } else {
                        let d = string.charCodeAt(i + 1);
                        if (ByteArray.inRange(d, 0xDC00, 0xDFFF)) {
                            let a = c & 0x3FF;
                            let b = d & 0x3FF;
                            i += 1;
                            cps.push(0x10000 + (a << 10) + b);
                        } else {
                            cps.push(0xFFFD);
                        }
                    }
                }
                i += 1;
            }
            return cps;
        }
    }
}