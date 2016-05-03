import java.util.HashMap;

import org.json.JSONObject;

import com.cycling74.max.DataTypes;
import com.cycling74.max.MaxObject;


public class Server extends MaxObject {
	protected ServerThread udpListener;
	
	public Server() {
		int[] outlets = {DataTypes.MESSAGE};
		this.declareOutlets(outlets);
	}
	
	public void bang() {
		udpListener = new ServerThread(this);
		udpListener.start();
	}
	
	public void closebang() {
		MaxObject.post("here");
		if (udpListener != null) {
			udpListener.stop();
		}
	}
	
	public void process(String data) {
		this.outlet(0, data);
	}
}
