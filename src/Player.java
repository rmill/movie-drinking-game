import java.util.ArrayList;
import java.util.List;

public class Player {
	
	String name;
	String token;
	List<Question> correctAnswers;
	Integer drinksReceived;
	
	public Player(String token, String name) {
		this.token = token;
		this.name = name;
		this.correctAnswers = new ArrayList<Question>();
		this.drinksReceived = 0;
	}
	
	public void addCorrectAnswer(Question question) {
		this.correctAnswers.add(question);
	}
}
