package com.osam2018.damoa.damoa;

/*
 * 부대 클래스입니다.
 * code : 부대 코드
 * name : 부대명
 * location : 부대의 대략적인 위치
 * markURL : 부대마크 URL
 * dest : 출발 / 도착 여부
 */
public class Unit {
    private String code;
    private String name;
    private String location;
    private String markURL;
    private String dest;

    public void SetName(String s)
    {
        this.name = s;
    }
    public String GetName()
    {
        return this.name;
    }

    public void SetDest(String s)
    {
        this.dest = s;
    }
    public String GetDest()
    {
        return this.dest;
    }

    public void SetLocation(String s)
    {
        this.location = s;
    }

    public String GetLocation()
    {
        return this.location;
    }

    public String GetURL()
    {
        return this.markURL;
    }

    public void SetURL(String url)
    {
        this.markURL = url;
    }

    public String GetCode()
    {
        return this.code;
    }

    public void SetCode(String c)
    {
        this.code = c;
    }
}
