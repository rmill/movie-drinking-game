import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.SocketException;

import com.cycling74.max.MaxObject;

class ServerThread implements Runnable {
    private Server server;
    private int port = 9876;
   
    public void run() {
	    MaxObject.post("Setting up UPD server on port: " + this.port);
		
	    DatagramSocket serverSocket;
		try {
			serverSocket = new DatagramSocket(this.port);
		} catch (SocketException e) {
			MaxObject.post("Error binding socket");
			return;
		}    
		
	    byte[] receiveData = new byte[1024];             
	   
	    while(true)                {                   
		    DatagramPacket receivePacket = new DatagramPacket(receiveData, receiveData.length);                   
		    try {
				serverSocket.receive(receivePacket);
			} catch (IOException e) {
				MaxObject.post("Error receiving message");
				return;
			}   
		    
		    String data = new String(receivePacket.getData());                   
		    MaxObject.post("RECEIVED: " + data);
		    
		    this.server.process(data);
	    }
    }
   
    public void start() {
        Thread thread = new Thread (this);
        thread.start ();
    }
}