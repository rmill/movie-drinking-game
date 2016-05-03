import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.SocketException;

import com.cycling74.max.MaxObject;

class ServerThread implements Runnable {
    private Server server;
    private Integer port = 9876;
    private DatagramSocket socket;
    private Boolean isStopped = true;
   
    ServerThread(Server server) {
    	this.server = server;
    }
    
    public void run() {
		while(true) {  
			if (isStopped) {
				socket.close();
				return;
			}
			
	    	byte[] receiveData = new byte[1024];
	    	DatagramPacket receivePacket = new DatagramPacket(receiveData, receiveData.length);                   
		    
	    	try {
				socket.receive(receivePacket);
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
    	MaxObject.post("Setting up UPD server on port: " + port);
    	
		try {
			socket = new DatagramSocket(port);
		} catch (SocketException e) {
			MaxObject.post("Error binding socket");
			return;
		}    
		
		isStopped = false;
    	
        Thread thread = new Thread(this);
        thread.start();
    }
    
    public void stop() {
    	MaxObject.post("Stopping UDP server on port: " + port);
    	isStopped = true;
    }
}