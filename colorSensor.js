
var TCS34725_ADDRESS = 0x29;

var TCS34725_ATIME = 0x01;
var TCS34725_ID = 0x012;
var TCS34725_COMMAND_BIT = 0x80; // The command to signal that we're command it to do something
var TCS34725_CONTROL = 0x0F;

var TCS34725_ENABLE = 0x00; // Enable operations
var TCS34725_ENABLE_PON = 0x01;
var TCS34725_ENABLE_AEN = 0x02; // RGBC Enable

var TCS34725_CDATAL = 0x14; // Clear channel data
var TCS34725_RDATAL = 0x16; // Red channel data
var TCS34725_GDATAL = 0x18; // Green channel data
var TCS34725_BDATAL = 0x1A; // Blue channel data

module.exports = function(five) {
  return (function() {

    function ColorSensor(opts) {
      if (!(this instanceof ColorSensor)) {
        return new ColorSensor(opts);
      }

      five.Board.Component.call(
        this, opts = five.Board.Options(opts)
      );

      this.io.i2cConfig();

      var command = function(byte) {
          return byte | 0x80;
      };

      this.io.i2cReadOnce(TCS34725_ADDRESS, command(TCS34725_ID), 8, function(bytes) {
        console.log(bytes);
      });

      this.io.i2cWriteReg(TCS34725_ADDRESS, command(TCS34725_ATIME), 0xF6);
      this.io.i2cWriteReg(TCS34725_ADDRESS, command(TCS34725_CONTROL), 0x01);
      this.io.i2cWriteReg(TCS34725_ADDRESS, command(TCS34725_ENABLE), TCS34725_ENABLE_PON);


      setTimeout(() => {
        this.io.i2cWriteReg(TCS34725_ADDRESS, command(TCS34725_ENABLE), TCS34725_ENABLE_PON | TCS34725_ENABLE_AEN);
      }, 6);


      const readColor = colorAddress => new Promise(resolve => this.io.i2cReadOnce(TCS34725_ADDRESS, command(colorAddress), 4, (bytes) => resolve(bytes[0]) ));


      this.getColors = function() {

        let c = readColor(TCS34725_CDATAL);
        let r = readColor(TCS34725_RDATAL);
        let g = readColor(TCS34725_GDATAL);
        let b = readColor(TCS34725_GDATAL);

        return Promise.all([r,g,b]).then(values => {
          return ({
            c: values[0],
            r: values[1],
            g: values[2],
            b: values[3],
          });
        });

      }


    }


    return ColorSensor;
  }());



};
