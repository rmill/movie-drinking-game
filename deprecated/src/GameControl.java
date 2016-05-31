import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map.Entry;

import org.json.JSONArray;
import org.json.JSONObject;

public class GameControl {

	protected HashMap<Integer, Question> questions;
	protected HashMap<String, Integer> currentAnswers;
	protected HashMap<String, Player> players;
	protected Question currentQuestion;
	
	public GameControl() {
		this.questions = new HashMap<Integer, Question>();
		this.currentAnswers = new HashMap<String, Integer>();
		this.players = new HashMap<String, Player>();
	}
	
	public void time(Integer time) {
		if (this.currentQuestion != null &&
			this.currentQuestion.isExpired(time)) 
		{
			this.finishQuestion();
		}else if (this.questions.containsKey(time)) {
			Question question = this.questions.get(time);
			
			if (this.currentQuestion == null &&
			    !question.isComplete()) 
			{
				this.startQuestion(question);
			}
		}
	}
	
	public void read(String name) {
		Path filePath = Paths.get("C:\\Users\\Ryan Mueller\\Documents\\GitHub\\movie-drinking-game\\Commando.json");
		List<String> fileContents;
		
		try {
			fileContents = Files.readAllLines(filePath);
		} catch (IOException e) {
			System.console().writer().println("Could not find file: " + name);
			return;
		}
		
		this.questions = new HashMap<Integer, Question>();
		
		JSONObject jsonData = new JSONObject(fileContents.get(0));
		JSONArray jsonQuestions = jsonData.getJSONArray("questions");
		
		for(int i=0; i < jsonQuestions.length(); i++) {
			JSONObject jsonQuestion = jsonQuestions.getJSONObject(i);
		    
			Question question = new Question(
				jsonQuestion.getInt("id"),
				jsonQuestion.getString("text"),
				jsonQuestion.getJSONArray("answers"),
				jsonQuestion.getJSONArray("correct_answers"),
				jsonQuestion.getInt("movie_time"),
				jsonQuestion.getInt("duration")	
			);
			
			System.console().writer().println("Adding question: " + question.getText());
			this.questions.put(question.getMovieTime(), question);
		}
	}

	public void anything(String message) {
		JSONObject jsonData = new JSONObject(message);
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
		if (players.containsKey(token)) {
			System.console().writer().println(String.format("User with token %s already exists", token));
			return;
		}
		
		System.console().writer().println(String.format("new_user: <%s, %s>", token, name));
		Player newPlayer = new Player(token, name);
		players.put(token, newPlayer);
	}
	
	public void answer(String token, Integer answer) {
		if (!players.containsKey(token)) {
			System.console().writer().println("Player not found");
		}
		
		if (currentAnswers.containsKey(token)) {
			return;
		}
		
		System.console().writer().println(String.format("answer: <%s, %d>", token, answer));
		currentAnswers.put(token, answer);
	}
	
	protected void startQuestion(Question question) {
		System.console().writer().println("Starting question: " + question.getText());
		
		this.currentQuestion = question;
		
		String[] render = {
			"image_surface_create",
			"img",
			String.format("question-%d.png", question.getId()), 
    		"image_surface_draw",
			"img,", 
    		"bang"
		};
	}
	
	protected void finishQuestion() {
		System.console().writer().println("Finishing question");
		
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
