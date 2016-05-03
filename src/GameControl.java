import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map.Entry;

import org.json.JSONArray;
import org.json.JSONObject;

import com.cycling74.max.Atom;
import com.cycling74.max.DataTypes;
import com.cycling74.max.MaxObject;

public class GameControl extends MaxObject {

	protected HashMap<Integer, Question> questions;
	protected HashMap<String, Integer> currentAnswers;
	protected HashMap<String, Player> players;
	protected Question currentQuestion;
	
	public GameControl() {
		int[] inlets = {DataTypes.MESSAGE};
		this.declareInlets(inlets);
		
		int[] outlets = {DataTypes.MESSAGE};
		this.declareOutlets(outlets);
		
		this.questions = new HashMap<Integer, Question>();
		this.currentAnswers = new HashMap<String, Integer>();
		this.players = new HashMap<String, Player>();
	}
	
	public void time(Atom[] atoms) {
		Integer time = atoms[0].getInt() / 1000;
		
		if (this.currentQuestion != null &&
			this.currentQuestion.isExpired(time)) 
		{
			this.finishQuestion();
		}else if (this.questions.containsKey(time)) {
			Question question = this.questions.get(time);
			
			if (!question.isComplete()) {
				this.currentQuestion = question;
				MaxObject.post("Starting question: " + this.currentQuestion.getText());
			}
		}
	}
	
	public void read(Atom[] atoms) {
		//Path filePath = Paths.get(atoms[0].getString());
		Path filePath = Paths.get("C:\\Users\\Ryan Mueller\\Documents\\GitHub\\movie-drinking-game\\Commando.json");
		List<String> fileContents;
		
		try {
			fileContents = Files.readAllLines(filePath);
		} catch (IOException e) {
			MaxObject.post("Error reading file");
			return;
		}
		
		this.questions = new HashMap<Integer, Question>();
		
		JSONObject jsonData = new JSONObject(fileContents.get(0));
		JSONArray jsonQuestions = jsonData.getJSONArray("questions");
		
		for(int i=0; i < jsonQuestions.length(); i++) {
			JSONObject jsonQuestion = jsonQuestions.getJSONObject(i);
		    
			Question question = new Question(
				jsonQuestion.getString("text"),
				jsonQuestion.getJSONArray("answers"),
				jsonQuestion.getJSONArray("correct_answers"),
				jsonQuestion.getInt("movie_time"),
				jsonQuestion.getInt("duration")	
			);
			
			MaxObject.post("Adding question: " + question.getText());
			this.questions.put(question.getMovieTime(), question);
		}
	}

	public void anything(Atom[] atoms) {
		String data = atoms[0].getString();
		JSONObject jsonData = new JSONObject(data);
		String token = jsonData.getString("token");
		
		switch(jsonData.getString("action")) {
			case "new_user": 
				String userName = jsonData.getString("user_name");
				this.newUser(token, userName); 
				break;
			case "answer": 
				Integer answer = jsonData.getInt("answer_id");
				this.answer(token, answer); 
				break;
		}
	}

	public void newUser(String token, String name) {
		MaxObject.post(String.format("new_user: <%s, %s>", token, name));
		
		if (players.containsKey(token)) {
			return;
		}
		
		Player newPlayer = new Player(token, name);
		players.put(token, newPlayer);
	}
	
	public void answer(String token, Integer answer) {
		MaxObject.post(String.format("answer: <%s, %d>", answer));
		
		if (!players.containsKey(token)) {
			MaxObject.post("Player not found");
		}
		
		if (currentAnswers.containsKey(token)) {
			return;
		}
		
		currentAnswers.put(token, answer);
	}
	
	protected void finishQuestion() {
		MaxObject.post("Finishing question");
		
		for (Entry<String, Integer> playerAnswer : this.currentAnswers.entrySet()) {
			String token = playerAnswer.getKey();
			Integer answer = playerAnswer.getValue();
			
			if (this.currentQuestion.isCorrect(answer)) {
				Player player = this.players.get(token);
				player.addCorrectAnswer(this.currentQuestion);
			}
		}
		
		this.currentQuestion.complete();
		this.currentQuestion = null;
	}
}
