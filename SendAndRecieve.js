let port;
let reader;
let endLoop = 0;

getCon = async (filters) => {
    if (port) {
      console.log('Port has already been opened');
      port.close();
    }

    try {
      port = await navigator.serial.requestPort({ filters });
      await port.open({ baudRate: 115200 });
      console.log('Port opened successfully');

      // TODO: Send data to Device using port.write()
    } catch (error) {
      console.log('Failed to open port:', error.message);
      if (port) {
        port.close();
        port = null;
      }
    }

    return port;
  }


  sendSerialData = async (port, data) => {

    const writer = port.writable.getWriter();
    await writer.write(data);

    writer.releaseLock();
  };

  sendACommand = async (command) => {
    endLoop = 0;

    if (!port) {
      console.log('Port has not been initialized');
      return;
    }

   // const version_in = encoder.encode(command);

    try {
  
      reader = port.readable.getReader();

      try {

        while (endLoop === 0) {
          try {

            await this.sendSerialData(port, command)
            //console.log('Data sent:', version_in);

          } catch (error) {
            console.log("Error occured While sending data")
          }

          await new Promise(r => setTimeout(r, 1000));
          const { value, done } = await reader.read();

          if (new TextDecoder().decode(value) === null) {

            console.log("Device closed or there is comm error")
            await port.close()
          }
          if (done) {
            console.log("log done")
            reader.cancel();
            break;
          }
          if (value) {

            console.log("send command function: " + new TextDecoder().decode(value));

            endLoop = 1

            console.log('sendACommand finished');
          }
          reader.releaseLock();

          return new TextDecoder().decode(value);
        }
      } catch (error) {
        console.log("There is a error", error + " " + error.message)
      }
      finally {
        // Allow the serial port to be closed later.
        if (reader) {
          reader.releaseLock();
        }
      }
    }
    catch (error) {
      console.log("Serial reader already locked")
      //if the error occurs release the locks to send data again
      //await port.close()
    }

  }
