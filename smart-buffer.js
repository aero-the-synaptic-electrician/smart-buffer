/**
 * @name SmartBuffer
 * @version 1.0.1
 */

 (global => {
    'use strict';

    /**
     * Please use SmartBuffer on a browser, 
     * as it is browser-only ( *hint* DataView wrapper)
     */

    if (!global.document)
        throw new Error('SmartBuffer requires a window with a document');

    class SmartBuffer {
        /**
         * Instantiates the current SmartBuffer
         * @param {ArrayBuffer} buffer The internal buffer to be used
         * @param {Number} offset Optional starting offset
         */
        constructor(buffer, offset) {
            /** The DataView for this wrapper instance */
            this.dataView = new DataView(buffer);

            /** 
             * The offset for I/O operations 
             * @default 0
             */

            this.offset = offset || 0;
        }
        
        /**
         * Increases current buffers capacity to the new value
         * @note This function is ignored if the current capacity exceeds the new value
         * @param {Number} capacity
         */
        reallocateIfNeeded(capacity) {
            let newCapacity = this.offset + capacity;

            if (newCapacity > this.length) {             
                let buffer = new ArrayBuffer(newCapacity),
                    view = new Uint8Array(buffer);
                
                view.set(new Uint8Array(this.buffer));

                this.dataView = new DataView(buffer);
            }
        }

        /**
         * Creates a new SmartBuffer instance with a set size
         * @param {Number} size Size for the internal buffer 
         * @returns {SmartBuffer}
         */
        static fromSize(size) {
            return new this(new ArrayBuffer(size));
        }

        /**
         * The internal buffer of the DataView
         * @returns {ArrayBuffer}
         */
        get buffer() {
            return this.dataView.buffer;
        }

        /**
         * The length of the DataView
         * @returns {Number}
         */
        get length() {
            return this.dataView.byteLength;
        }

        /**
         * Whether or not there are bytes that can be consumed
         * @returns {Number}
         */
        get eof() {
            return this.offset >= this.length;
        }

        /**
         * Wrapper to call arbitrary read functions
         * @param {Function} callback The arbitrary reading function
         * @param {Number} size The amount of byte(s) to be consumed
         * @param {Boolean} endianness The endianness for reading the value
         * @param {Number} offset Optional offset to be incremented by
         * @returns {*}
         */
        read(callback, size, endianness, offset) {
            let value = callback.call(this.dataView, offset || this.offset, endianness);

            offset || void(this.offset += size);

            return value;
        }

        /**
         * Wrapper to call arbitrary writing functions
         * @param {Function} callback The arbitrary reading function
         * @param {Number} size The amount of byte(s) to be consumed
         * @param {*} value The value to be written
         * @param {Boolean} endianness The endianness for writing the value
         */

        write(callback, size, value, endianness) {
            callback.call(this.dataView, this.offset, value, endianness);

            this.offset += size;
        }

        /**
         * Returns a Int8 at the current offset, then 
         * increments the current offset by one byte
         * @param {Number} offset
         * @returns {Number }
         */
        readInt8(offset) {
            return this.read(DataView.prototype.getInt8, 1, null, offset);
        }

        /**
         * Returns a UInt8 at the current offset, then 
         * increments the current offset by one byte
         * @param {Number} offset
         * @returns {Number }
         */
        readUInt8(offset) {
            return this.read(DataView.prototype.getUint8, 1, null, offset);
        }

        /**
         * Returns a Int16LE at the current offset, then 
         * increments the current offset by two bytes
         * @param {Number} offset
         * @returns {Number }
         */
        readInt16LE(offset) {
            return this.read(DataView.prototype.getInt16, 2, true, offset);
        }

        /**
         * Returns a Int16BE at the current offset, then 
         * increments the current offset by two bytes
         * @param {Number} offset
         * @returns {Number }
         */
        readInt16BE(offset) {
            return this.read(DataView.prototype.getInt16, 2, false, offset);
        }

        /**
         * Returns a UInt16LE at the current offset, then 
         * increments the current offset by two bytes
         * @param {Number} offset
         * @returns {Number }
         */
        readUInt16LE(offset) {
            return this.read(DataView.prototype.getUint16, 2, true, offset);
        }

        /**
         * Returns a UInt16BE at the current offset, then 
         * increments the current offset by two bytes
         * @param {Number} offset
         * @returns {Number }
         */
        readUInt16BE(offset) {
            return this.read(DataView.prototype.getUint16, 2, false, offset);
        }

        /**
         * Returns a Int32LE at the current offset, then 
         * increments the current offset by four bytes
         * @param {Number} offset
         * @returns {Number }
         */
        readInt32LE(offset) {
            return this.read(DataView.prototype.getInt32, 4, true, offset);
        }

        /**
         * Returns a Int32BE at the current offset, then 
         * increments the current offset by four bytes
         * @param {Number} offset
         * @returns {Number }
         */
        readInt32BE(offset) {
            return this.read(DataView.prototype.getInt32, 4, false, offset);
        }

        /**
         * Returns a UInt32LE at the current offset, then 
         * increments the current offset by four bytes
         * @param {Number} offset
         * @returns {Number }
         */
        readUInt32LE(offset) {
            return this.read(DataView.prototype.getUint32, 4, true, offset);
        }

        /**
         * Returns a UInt32BE at the current offset, then 
         * increments the current offset by four bytes
         * @param {Number} offset
         * @returns {Number }
         */
        readUInt32BE(offset) {
            return this.read(DataView.prototype.getUint32, 4, false, offset);
        }

        /**
         * Reads a UTF-16 string until a null-terminator or I/O throughput is met
         * @returns {String}
         */
        readString16() {
            let result = "";

            for (let ch; ch = this.readUInt16LE(); !this.eof && ch !== 0)
                result += String.fromCharCode(ch);

            return result;
        }

        /**
         * Reads a UTF-8 string until a null-terminator or I/O throughput is met
         * @returns {String}
         */
        readString() {
            let result = "";

            for (let ch; ch = this.readUInt8(); !this.eof && ch !== 0)
                result += String.fromCharCode(ch);

            return result;
        }

        /**
         * Reads a escaped UTF-8 string
         * @returns {String}
         */
         readEscapedString() {
            return decodeURIComponent(escape(this.readString()));
        }

        /**
         * Writes a Int8 at the current offset, then 
         * increments the current offset by one byte
         * @param {Number} value
         */
        writeInt8(value) {
            this.write(DataView.prototype.setInt8, 1, value, null);
        }

        /**
         * Writes a UInt8 at the current offset, then 
         * increments the current offset by one byte
         * @param {Number} value
         */
        writeUInt8(value) {
            this.write(DataView.prototype.setUint8, 1, value, null);
        }

        /**
         * Writes a Int16LE at the current offset, then 
         * increments the current offset by two bytes
         * @param {Number} value
         */
        writeInt16LE(value) {
            this.write(DataView.prototype.setInt16, 2, value, true);
        }

        /**
         * Writes a Int16BE at the current offset, then 
         * increments the current offset by two bytes
         * @param {Number} value
         */
        writeInt16BE(value) {
            this.write(DataView.prototype.setInt16, 2, value, false);
        }

        /**
         * Writes a UInt16LE at the current offset, then 
         * increments the current offset by two bytes
         * @param {Number} value
         */
        writeUInt16LE(value) {
            this.write(DataView.prototype.setUint16, 2, value, true);
        }

        /**
         * Writes a UInt16BE at the current offset, then 
         * increments the current offset by two bytes
         * @param {Number} value
         */
        writeUInt16BE(value) {
            this.write(DataView.prototype.setUint16, 2, value, false);
        }

        /**
         * Writes a Int32LE at the current offset, then 
         * increments the current offset by four bytes
         * @param {Number} value
         */
        writeInt32LE(value) {
            this.write(DataView.prototype.setInt32, 4, value, true);
        }

        /**
         * Writes a Int32BE at the current offset, then 
         * increments the current offset by four bytes
         * @param {Number} value
         */
        writeInt32BE(value) {
            this.write(DataView.prototype.setInt32, 4, value, false);
        }

        /**
         * Writes a UInt32LE at the current offset, then 
         * increments the current offset by four bytes
         * @param {Number} value
         */
        writeUInt32LE(value) {
            this.write(DataView.prototype.setUint32, 4, value, true);
        }

        /**
         * Writes a UInt32BE at the current offset, then 
         * increments the current offset by four bytes
         * @param {Number} value
         */
        writeUInt32BE(value) {
            this.write(DataView.prototype.setUint32, 4, value, false);
        }

        /**
         * Writes a UTF-8 string
         * @param {String} value 
         */
        writeString(value) {
            this.reallocateIfNeeded(value.length);
            
            for (let index in value)
                this.writeUInt8(value.charCodeAt(index));
        }

        /**
         * Writes a UTF-8 string with a null-terminator
         * @param {String} value 
         */
        writeStringNT(value) {
            this.writeString(value);
            this.reallocateIfNeeded(1);
            this.writeUInt8(0);
        }

        /**
         * Writes a escaped UTF-8 string
         * @param {String} value 
         */
        writeEscapedString(value) {
            this.writeString(unescape(encodeURIComponent(value)));
        }
    }

    global.SmartBuffer = SmartBuffer;
})(typeof window !== 'undefined' ? window : this);
