import java.util.ArrayList;
import java.util.List;

import org.json.JSONArray;

public class Question {
	Integer id;
	String text;
	List<String> answers;
	List<Integer> correctAnswers;
	Integer movieTime;
	Integer duration;
	Boolean isComplete;
	
	public Question(Integer id, String text, JSONArray answers, JSONArray correctAnswers, Integer movieTime, Integer duration) {
		this.id = id;
		this.text = text;
		this.movieTime = movieTime;
		this.duration = duration;
		this.isComplete = false;
		
		this.answers = new ArrayList<String>();      
	    for (int i=0; i < answers.length(); i++){ 
	    	this.answers.add(answers.getString(i));
	    }
	    
	    this.correctAnswers = new ArrayList<Integer>();      
	    for (int i=0; i < correctAnswers.length(); i++){ 
	    	this.correctAnswers.add(correctAnswers.getInt(i));
	    }
	}

	public boolean isCorrect(Integer answer) {
		return this.correctAnswers.contains(answer);
	}
	
	public Integer getId() {
		return this.id;
	}

	public Integer getMovieTime() {
		return this.movieTime;
	}

	public String getText() {
		return this.text;
	}

	public Boolean isExpired(Integer currentTime) {
		return ((this.movieTime + this.duration) <= currentTime);
	}
	
	public Boolean isComplete() {
		return this.isComplete;
	}
	
	public void complete() {
		this.isComplete = true;
	}
}
