package com.osam2018.damoa.damoa;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.support.v7.app.ActionBar;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class JoinActivity extends AppCompatActivity {

    private EditText editTextPW2, editTextPW, editTextPhone, editTextSN, editTextName;
    private Button btnJoin;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_join);

        /***************  액션바 설정 ***************/
        getSupportActionBar().setDisplayOptions(ActionBar.DISPLAY_SHOW_CUSTOM);
        getSupportActionBar().setCustomView(R.layout.title);

        /***************  UI 연결 ***************/
        editTextName = (EditText)findViewById(R.id.editTextName);
        editTextSN = (EditText)findViewById(R.id.editTextSN);
        editTextPhone = (EditText)findViewById(R.id.editTextPhone);
        editTextPW = (EditText)findViewById(R.id.editTextPW);
        editTextPW2 = (EditText)findViewById(R.id.editTextPW2);
        btnJoin = (Button)findViewById(R.id.btnJoinComplete);

        //회원가입 누를 경우
        btnJoin.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                //패스워드 같은지 확인한다.
                if(!editTextPW.getText().toString().equals(editTextPW2.getText().toString()))
                {
                    editTextPW.setText("");
                    editTextPW2.setText("");
                    AlertDialog alertDialog = new AlertDialog.Builder(JoinActivity.this).create();
                    alertDialog.setTitle("회원가입 실패");
                    alertDialog.setMessage("패스워드가 서로 다릅니다. 패스워드를 다시 입력해 주십시오.");
                    alertDialog.setButton(AlertDialog.BUTTON_NEUTRAL, "확인",
                            new DialogInterface.OnClickListener() {
                                public void onClick(DialogInterface dialog, int which) {
                                    dialog.dismiss();
                                }
                            });
                    alertDialog.show();
                }
                else {
                    //패스워드가 일치하다면 회원가입을 시도한다.
                    Thread thread = new Thread(new Runnable() {
                        @Override
                        public void run() {
                            WRequest wr = new WRequest();
                            final String res = wr.SendPost("https://damoa.live2skull.net/users/join",
                                    "sn=" + editTextSN.getText().toString() +
                                            "&password=" + encryptSHA512(editTextPW.getText().toString()) +
                                            "&realname=" + editTextName.getText().toString() +
                                            "&phone=" + editTextPhone.getText().toString());
                            //회원가입 실패라면
                            if (res.contains("\"result\":false")) {
                                JoinActivity.this.runOnUiThread(new Runnable() {
                                    public void run() {
                                        AlertDialog alertDialog = new AlertDialog.Builder(JoinActivity.this).create();
                                        alertDialog.setTitle("회원가입 실패");
                                        alertDialog.setMessage("회원가입에 실패하였습니다. 군번을 확인해 주십시오.");
                                        alertDialog.setButton(AlertDialog.BUTTON_NEUTRAL, "확인",
                                                new DialogInterface.OnClickListener() {
                                                    public void onClick(DialogInterface dialog, int which) {
                                                        dialog.dismiss();
                                                    }
                                                });
                                        alertDialog.show();
                                    }
                                });
                            }
                            //회원가입 성공이라면
                            else {
                                JoinActivity.this.runOnUiThread(new Runnable() {
                                    public void run() {
                                        AlertDialog alertDialog = new AlertDialog.Builder(JoinActivity.this).create();
                                        alertDialog.setTitle("회원가입 성공");
                                        alertDialog.setMessage("회원가입에 성공하였습니다.");
                                        alertDialog.setButton(AlertDialog.BUTTON_NEUTRAL, "확인",
                                                new DialogInterface.OnClickListener() {
                                                    public void onClick(DialogInterface dialog, int which) {
                                                        dialog.dismiss();
                                                        finish();
                                                    }
                                                });
                                        alertDialog.show();
                                    }
                                });
                            }
                        }
                    });
                    thread.start();
                }
            }
        });
    }
    //SHA512 암호화 함수입니다.
    private String encryptSHA512(String s)
    {
        try{
            MessageDigest md = MessageDigest.getInstance("SHA-512");
            byte[] digest = md.digest(s.getBytes());
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < digest.length; i++)
                sb.append(Integer.toString((digest[i] & 0xff) + 0x100, 16).substring(1));
            return sb.toString();
        }catch (NoSuchAlgorithmException ex)
        {
            return "Err";
        }
    }

}
