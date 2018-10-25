package com.osam2018.damoa.damoa;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.support.v7.app.ActionBar;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.content.SharedPreferences;
import android.widget.EditText;
import android.widget.Toast;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class LoginActivity extends AppCompatActivity {
    private SharedPreferences sharedPref;
    private Button btnJoin, btnLogin;
    private EditText etSN, etPW;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);
        /***************  액션바 숨김 처리 ***************/
        getSupportActionBar().hide();
        /***************  UI 연결 ***************/
        btnJoin = (Button)findViewById(R.id.btnJoin);
        btnLogin = (Button)findViewById(R.id.btnLogin);
        etSN = (EditText)findViewById(R.id.loginSN);
        etPW = (EditText)findViewById(R.id.loginPW);

        sharedPref = getSharedPreferences("login", MODE_PRIVATE);

        //세션을 불러옴
        final String session = sharedPref.getString("session", "");

        //세션이 있다면
        if(!session.equals(""))
        {
            Thread thread = new Thread(new Runnable() {
                @Override
                public void run() {
                    WRequest wr = new WRequest();
                    wr.SetCookie(session);
                    final String res = wr.SendPost("https://damoa.live2skull.net/users/check", "");
                    //세션이 사용 가능하다면
                    if(!res.contains("\"result\":false"))
                    {
                        //세션만료여부 체크한다.
                        LoginActivity.this.runOnUiThread(new Runnable() {
                            public void run() {
                                Intent intent = new Intent(getApplicationContext(),
                                        MainActivity.class);
                                startActivity(intent);
                                finish();
                            }
                        });
                    }
                }
            });
            thread.start();
        }
        //회원가입 버튼 리스너 등록
        btnJoin.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(getApplicationContext(),
                        JoinActivity.class);
                startActivity(intent);
            }
        });
        //로그인 버튼 리스너 등록
        btnLogin.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                //로그인 처리
                Thread thread = new Thread(new Runnable(){
                    @Override
                    public void run(){
                        Login(etSN.getText().toString(), etPW.getText().toString());
                    }
                });
                thread.start();
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

    /*
     * 로그인 함수입니다.
     * 군번과 패스워드를 파라메터로 전달하면 로그인합니다.
     */
    public void Login(String sn, String pw)
    {
        WRequest wr = new WRequest();
        final String res = wr.SendPost("https://damoa.live2skull.net/users/login", "sn=" + sn + "&password=" + encryptSHA512(pw));
        //로그인 실패할 경우 알림창을 띄운다.
        if(res.contains("\"result\":false"))
        {
            LoginActivity.this.runOnUiThread(new Runnable() {
                public void run() {
                    AlertDialog alertDialog = new AlertDialog.Builder(LoginActivity.this).create();
                    alertDialog.setTitle("로그인 실패");
                    alertDialog.setMessage("로그인에 실패하였습니다. 아이디 또는 비밀번호를 확인해 주십시오.");
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
        //로그인 성공일 경우
        else {
            //쿠키를 가져오고 저장한다.
            String cookie = wr.GetCookie();
            SharedPreferences.Editor editor = sharedPref.edit();
            editor.putString("session", cookie);
            editor.commit();

            //메인액티비티를 띄운다.
            LoginActivity.this.runOnUiThread(new Runnable() {
                public void run() {
                    Intent intent = new Intent(getApplicationContext(),
                            MainActivity.class);
                    startActivity(intent);
                    finish();
                }
            });
        }
    }


}
