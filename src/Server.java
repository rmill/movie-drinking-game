import com.cycling74.max.MaxObject;


public class Server extends MaxObject { 
	
	public void bang() {
		ServerThread thread = new ServerThread();
		thread.start();
	}
	
	public void process(String data) {
		
	}
}
